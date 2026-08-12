import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { NotFoundError } from "@/lib/errors";
import { serializeOrderDetail } from "../serialize";

// `id` may be either the order's cuid (internal links) or its orderNumber
// (Midtrans Snap `callbacks.finish` redirects here using orderNumber, since
// it's generated before the Order row exists — see POST /api/orders).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    return apiSuccess(serializeOrderDetail(order));
  } catch (error) {
    return apiErrorFromException(error);
  }
}
