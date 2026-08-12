import type { Prisma } from "@/generated/prisma/client";

/** Restores product stock for every item on an order — called when a
 * pending order expires/is cancelled/denied, or a paid order is refunded.
 * Must run inside the same transaction as the order status update so stock
 * and order state never drift apart. */
export async function restoreOrderStock(tx: Prisma.TransactionClient, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId }, select: { productId: true, quantity: true } });
  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }
}
