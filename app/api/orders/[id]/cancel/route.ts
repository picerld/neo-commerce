import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { restoreOrderStock } from "@/lib/orders/restore-stock";
import { serializeOrderDetail } from "../../serialize";

// User-initiated cancel — only allowed while still pending_payment (before
// Midtrans settles). Once paid, only an admin can move an order to refunded.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const existing = await prisma.order.findFirst({ where: { id, userId: session.userId } });
    if (!existing) throw new NotFoundError("Pesanan tidak ditemukan");
    if (existing.status !== "pending_payment") {
      throw new ConflictError("Pesanan ini tidak bisa dibatalkan lagi");
    }

    const order = await prisma.$transaction(async (tx) => {
      await restoreOrderStock(tx, existing.id);
      return tx.order.update({
        where: { id: existing.id },
        data: {
          status: "cancelled",
          payment: { update: { status: "cancel" } },
        },
        include: { items: true, payment: true, user: true },
      });
    });

    return apiSuccess(serializeOrderDetail(order), "Pesanan dibatalkan");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
