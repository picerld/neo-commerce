import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { BadRequestError, ConflictError } from "@/lib/errors";
import { checkoutFormSchema } from "@/app/features/orders/forms/checkout";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { createSnapTransaction } from "@/lib/midtrans";
import { getCourierByCode } from "@/lib/shipping/couriers";
import { serializeOrderDetail, serializeOrderSummary } from "./serialize";
import type { CheckoutResponse } from "@/app/features/orders/types/order.type";

export async function GET() {
  try {
    const session = await requireSession();

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(orders.map(serializeOrderSummary));
  } catch (error) {
    return apiErrorFromException(error);
  }
}

// Checkout: turns the caller's cart into an Order + Payment, deducting stock
// and creating a Midtrans Snap transaction. Stock is re-validated with a
// conditional decrement inside the transaction (not just the earlier read)
// to stay correct under concurrent checkouts of the same product.
export async function POST(request: Request) {
  try {
    const session = await requireSession();

    const body = await request.json();
    const data = checkoutFormSchema.parse(body);

    const courier = getCourierByCode(data.courierCode);
    if (!courier) {
      throw new BadRequestError("Kurir tidak valid");
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestError("Keranjang kosong");
    }

    const unavailable = cartItems.find((item) => !item.product.isActive || item.product.stock < item.quantity);
    if (unavailable) {
      throw new ConflictError(`Stok "${unavailable.product.name}" tidak mencukupi`);
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + courier.price;
    const orderNumber = generateOrderNumber();

    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });

    const snap = await createSnapTransaction({
      orderNumber,
      grossAmount: total,
      customer: { name: user.name, email: user.email, phone: user.phone ?? data.recipientPhone },
      items: [
        ...cartItems.map((item) => ({
          id: item.productId,
          price: item.product.price,
          quantity: item.quantity,
          name: item.product.name,
        })),
        { id: "shipping", price: courier.price, quantity: 1, name: `Ongkos Kirim (${courier.name} ${courier.service})` },
      ],
    });

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new ConflictError(`Stok "${item.product.name}" tidak mencukupi`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          subtotal,
          shippingFee: courier.price,
          courierName: courier.name,
          courierService: courier.service,
          total,
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          shippingAddress: data.shippingAddress,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImageUrl: item.product.imageUrl,
              price: item.product.price,
              quantity: item.quantity,
              subtotal: item.product.price * item.quantity,
            })),
          },
          payment: {
            create: {
              midtransOrderId: orderNumber,
              grossAmount: total,
              snapToken: snap.token,
              redirectUrl: snap.redirectUrl,
            },
          },
        },
        include: { items: true, payment: true },
      });

      await tx.cartItem.deleteMany({ where: { userId: session.userId } });

      return created;
    });

    const response: CheckoutResponse = {
      order: serializeOrderDetail(order),
      snapToken: order.payment?.snapToken ?? null,
    };

    return apiSuccess(response, "Pesanan dibuat", 201);
  } catch (error) {
    return apiErrorFromException(error);
  }
}
