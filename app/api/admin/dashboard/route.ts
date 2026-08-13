import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { computeAvailableBalance } from "@/lib/withdrawals/balance";
import { serializeOrderSummary } from "../../orders/serialize";
import { serializeProduct } from "../../products/serialize";
import type { DashboardResponse } from "@/app/features/admin-dashboard/types/dashboard.type";
import type { OrderStatus } from "@/generated/prisma/client";

const LOW_STOCK_THRESHOLD = 5;

export async function GET() {
  try {
    await requireRole("admin");

    const [balance, statusCounts, lowStockProducts, recentOrders] = await Promise.all([
      computeAvailableBalance(),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        include: { category: true },
        orderBy: { stock: "asc" },
        take: 10,
      }),
      prisma.order.findMany({
        include: { items: true, user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const orderCounts = Object.fromEntries(
      statusCounts.map((row) => [row.status, row._count._all]),
    ) as Partial<Record<OrderStatus, number>>;

    const response: DashboardResponse = {
      balance,
      orderCounts,
      lowStockProducts: lowStockProducts.map((product) => serializeProduct(product)),
      recentOrders: recentOrders.map(serializeOrderSummary),
    };

    return apiSuccess(response);
  } catch (error) {
    return apiErrorFromException(error);
  }
}
