import type { Prisma } from "@/generated/prisma/client";
import type { MidtransPaymentStatus } from "@/lib/midtrans";
import { restoreOrderStock } from "./restore-stock";

export type ApplyPaymentStatusParams = {
  paymentId: string;
  orderId: string;
  /** The order's status *before* this update — decides which transition (if any) applies. */
  orderStatus: string;
  status: MidtransPaymentStatus;
  transactionId?: string;
  paymentType?: string | null;
  vaNumber?: string | null;
  rawPayload?: object;
};

/** Applies a Midtrans payment status to an order + payment row — shared by
 * the notification webhook and the manual "check status" sync endpoint so
 * both paths run the exact same transition/idempotency rules instead of
 * two copies drifting apart. Must run inside a transaction. */
export async function applyPaymentStatus(tx: Prisma.TransactionClient, params: ApplyPaymentStatusParams) {
  const { orderId, orderStatus, status } = params;

  const paymentUpdate = {
    status,
    transactionId: params.transactionId,
    paymentType: params.paymentType,
    vaNumber: params.vaNumber,
    rawPayload: params.rawPayload,
    ...(status === "settlement" || status === "capture" ? { paidAt: new Date() } : {}),
    ...(status === "expire" ? { expiredAt: new Date() } : {}),
  };

  // Only transition the order the first time we see a terminal status —
  // guards against a duplicate notification (or a manual sync after the
  // webhook already landed) from double-restoring stock or clobbering a
  // further-along status.
  if ((status === "settlement" || status === "capture") && orderStatus === "pending_payment") {
    await tx.order.update({ where: { id: orderId }, data: { status: "paid", paidAt: new Date() } });
  } else if (status === "expire" && orderStatus === "pending_payment") {
    await restoreOrderStock(tx, orderId);
    await tx.order.update({ where: { id: orderId }, data: { status: "expired" } });
  } else if ((status === "cancel" || status === "deny") && orderStatus === "pending_payment") {
    await restoreOrderStock(tx, orderId);
    await tx.order.update({ where: { id: orderId }, data: { status: "cancelled" } });
  } else if ((status === "refund" || status === "partial_refund") && ["paid", "processing", "shipped", "completed"].includes(orderStatus)) {
    await restoreOrderStock(tx, orderId);
    await tx.order.update({ where: { id: orderId }, data: { status: "refunded" } });
  }

  await tx.payment.update({ where: { id: params.paymentId }, data: paymentUpdate });
}
