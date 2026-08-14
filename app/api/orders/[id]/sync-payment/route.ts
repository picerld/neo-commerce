import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { NotFoundError, BadRequestError } from "@/lib/errors";
import { getTransactionStatus, mapTransactionStatus } from "@/lib/midtrans";
import { applyPaymentStatus } from "@/lib/orders/apply-payment-status";
import { serializeOrderDetail } from "../../serialize";

// Manual fallback for the notification webhook — Midtrans can't reach a
// localhost dev server, so this lets the order page pull the current status
// directly from Midtrans's Get Transaction Status API instead of waiting on
// a webhook that will never arrive there. Safe to call any time (idempotent
// via the same transition rules as the webhook), so it's also just a
// reasonable "refresh status" action in production.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true, payment: true, user: true },
    });

    if (!order) throw new NotFoundError("Pesanan tidak ditemukan");
    if (session.role !== "admin" && order.userId !== session.userId) {
      throw new NotFoundError("Pesanan tidak ditemukan");
    }
    if (!order.payment) throw new BadRequestError("Pesanan ini belum memiliki transaksi pembayaran");

    const payload = await getTransactionStatus(order.payment.midtransOrderId);
    const status = mapTransactionStatus(payload);
    const vaNumber = payload.va_numbers?.[0]?.va_number ?? null;

    await prisma.$transaction(async (tx) => {
      await applyPaymentStatus(tx, {
        paymentId: order.payment!.id,
        orderId: order.id,
        orderStatus: order.status,
        status,
        transactionId: payload.transaction_id,
        paymentType: payload.payment_type,
        vaNumber,
        rawPayload: payload as object,
      });
    });

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true, payment: true, user: true },
    });

    return apiSuccess(serializeOrderDetail(updated));
  } catch (error) {
    return apiErrorFromException(error);
  }
}
