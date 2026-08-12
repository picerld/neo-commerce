import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { restoreOrderStock } from "@/lib/orders/restore-stock";
import { mapTransactionStatus, verifyNotificationSignature, type MidtransNotificationPayload } from "@/lib/midtrans";

// Midtrans HTTP notification webhook — configure this URL (APP_URL +
// /api/webhooks/midtrans) in the Midtrans dashboard under
// Settings > Configuration > Payment Notification URL.
//
// Always returns 200 unless the signature is invalid — Midtrans retries
// aggressively on non-2xx, and a malformed/unknown-order notification isn't
// worth retrying.
export async function POST(request: Request) {
  const payload = (await request.json()) as MidtransNotificationPayload;

  if (!verifyNotificationSignature(payload)) {
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
  }

  const payment = await prisma.payment.findUnique({
    where: { midtransOrderId: payload.order_id },
    include: { order: true },
  });

  if (!payment) {
    return NextResponse.json({ success: true, message: "Order not found, ignored" });
  }

  const status = mapTransactionStatus(payload);
  const vaNumber = payload.va_numbers?.[0]?.va_number ?? null;

  await prisma.$transaction(async (tx) => {
    const paymentUpdate = {
      status,
      transactionId: payload.transaction_id,
      paymentType: payload.payment_type,
      vaNumber,
      rawPayload: payload as object,
      ...(status === "settlement" || status === "capture" ? { paidAt: new Date() } : {}),
      ...(status === "expire" ? { expiredAt: new Date() } : {}),
    };

    // Only transition the order the first time we see a terminal status —
    // guards against Midtrans re-sending the same notification (or a stray
    // late one after the order already moved on) from double-restoring
    // stock or clobbering a further-along status.
    if ((status === "settlement" || status === "capture") && payment.order.status === "pending_payment") {
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "paid", paidAt: new Date() } });
    } else if (status === "expire" && payment.order.status === "pending_payment") {
      await restoreOrderStock(tx, payment.orderId);
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "expired" } });
    } else if ((status === "cancel" || status === "deny") && payment.order.status === "pending_payment") {
      await restoreOrderStock(tx, payment.orderId);
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "cancelled" } });
    } else if (
      (status === "refund" || status === "partial_refund") &&
      ["paid", "processing", "shipped", "completed"].includes(payment.order.status)
    ) {
      await restoreOrderStock(tx, payment.orderId);
      await tx.order.update({ where: { id: payment.orderId }, data: { status: "refunded" } });
    }

    await tx.payment.update({ where: { id: payment.id }, data: paymentUpdate });
  });

  return NextResponse.json({ success: true, message: "OK" });
}
