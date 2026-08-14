import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyPaymentStatus } from "@/lib/orders/apply-payment-status";
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
    await applyPaymentStatus(tx, {
      paymentId: payment.id,
      orderId: payment.orderId,
      orderStatus: payment.order.status,
      status,
      transactionId: payload.transaction_id,
      paymentType: payload.payment_type,
      vaNumber,
      rawPayload: payload as object,
    });
  });

  return NextResponse.json({ success: true, message: "OK" });
}
