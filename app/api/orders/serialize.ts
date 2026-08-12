import type { Order, OrderItem, Payment, User } from "@/generated/prisma/client";
import type { OrderDetail, OrderSummary } from "@/app/features/orders/types/order.type";

type OrderWithItems = Order & { items: OrderItem[]; user?: User };

export function serializeOrderSummary(order: OrderWithItems): OrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    ...(order.user ? { customer: { id: order.user.id, name: order.user.name, email: order.user.email } } : {}),
  };
}

export function serializeOrderDetail(order: OrderWithItems & { payment: Payment | null }): OrderDetail {
  return {
    ...serializeOrderSummary(order),
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    payment: order.payment
      ? {
          status: order.payment.status,
          paymentType: order.payment.paymentType,
          snapToken: order.payment.snapToken,
          redirectUrl: order.payment.redirectUrl,
          vaNumber: order.payment.vaNumber,
          paidAt: order.payment.paidAt?.toISOString() ?? null,
          expiredAt: order.payment.expiredAt?.toISOString() ?? null,
        }
      : null,
  };
}
