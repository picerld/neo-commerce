import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { addToCartFormSchema } from "@/app/features/cart/forms/cart";
import { serializeCart } from "./serialize";

export async function GET() {
  try {
    const session = await requireSession();

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(serializeCart(cartItems));
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    const body = await request.json();
    const data = addToCartFormSchema.parse(body);

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || !product.isActive) {
      return apiError("Produk tidak tersedia", 404);
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: session.userId, productId: data.productId } },
    });

    const desiredQuantity = Math.min((existing?.quantity ?? 0) + data.quantity, product.stock);
    if (desiredQuantity <= 0) {
      return apiError("Stok produk habis", 409);
    }

    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: session.userId, productId: data.productId } },
      update: { quantity: desiredQuantity },
      create: { userId: session.userId, productId: data.productId, quantity: desiredQuantity },
    });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });

    return apiSuccess(serializeCart(cartItems), "Ditambahkan ke keranjang");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
