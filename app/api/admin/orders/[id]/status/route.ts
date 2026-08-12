import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { restoreOrderStock } from "@/lib/orders/restore-stock";
import { updateOrderStatusFormSchema } from "@/app/features/orders/forms/order-status";
import { serializeOrderDetail } from "../../../../orders/serialize";

// Allowed forward transitions per current status — keeps the fulfillment
// lifecycle linear (paid -> processing -> shipped -> completed) with
// `refunded` reachable from any post-payment state.
const ALLOWED_FROM: Record<string, string[]> = {
  paid: ["processing", "refunded"],
  processing: ["shipped", "refunded"],
  shipped: ["completed", "refunded"],
  completed: ["refunded"],
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin");
    const { id } = await params;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Pesanan tidak ditemukan");

    const body = await request.json();
    const data = updateOrderStatusFormSchema.parse(body);

    const allowed = ALLOWED_FROM[existing.status] ?? [];
    if (!allowed.includes(data.status)) {
      throw new ConflictError(`Pesanan berstatus "${existing.status}" tidak bisa diubah ke "${data.status}"`);
    }

    const order = await prisma.$transaction(async (tx) => {
      if (data.status === "refunded") {
        await restoreOrderStock(tx, existing.id);
      }
      return tx.order.update({
        where: { id: existing.id },
        data: {
          status: data.status,
          ...(data.trackingNumber ? { trackingNumber: data.trackingNumber } : {}),
        },
        include: { items: true, payment: true, user: true },
      });
    });

    return apiSuccess(serializeOrderDetail(order), "Status pesanan diupdate");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
