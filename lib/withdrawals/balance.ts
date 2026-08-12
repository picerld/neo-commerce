import { prisma } from "@/lib/prisma";

/** Platform available balance = revenue from orders that have been paid (or
 * further along the fulfillment lifecycle) minus refunded orders' totals
 * minus everything already withdrawn. Cancelled/expired/pending orders never
 * contributed revenue, so they're excluded entirely. */
export async function computeAvailableBalance() {
  const [revenueAgg, refundedAgg, withdrawnAgg] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["paid", "processing", "shipped", "completed"] } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "refunded" },
    }),
    prisma.withdrawalRecord.aggregate({ _sum: { amount: true } }),
  ]);

  const revenue = revenueAgg._sum.total ?? 0;
  const refunded = refundedAgg._sum.total ?? 0;
  const withdrawn = withdrawnAgg._sum.amount ?? 0;

  return {
    revenue,
    refunded,
    withdrawn,
    available: revenue - refunded - withdrawn,
  };
}
