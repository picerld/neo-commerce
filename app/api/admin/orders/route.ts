import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { serializeOrderSummary } from "../../orders/serialize";
import type { Prisma, OrderStatus } from "@/generated/prisma/client";

const VALID_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
  "expired",
  "refunded",
];

export async function GET(request: Request) {
  try {
    await requireRole("admin");

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Prisma.OrderWhereInput = {};
    if (status && VALID_STATUSES.includes(status)) where.status = status as OrderStatus;

    const orders = await prisma.order.findMany({
      where,
      include: { items: true, user: true },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(orders.map(serializeOrderSummary));
  } catch (error) {
    return apiErrorFromException(error);
  }
}
