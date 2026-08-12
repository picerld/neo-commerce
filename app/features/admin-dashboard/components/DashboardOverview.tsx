"use client";

import Link from "next/link";
import { Wallet, TrendingUp, Undo2, PiggyBank, AlertTriangle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import OrderStatusBadge from "@/app/features/orders/components/OrderStatusBadge";
import { formatRupiah } from "@/lib/utils";
import { useGetDashboard } from "../api/getDashboard";

const STAT_CARDS = [
  { key: "revenue" as const, label: "Total Pendapatan", icon: TrendingUp },
  { key: "available" as const, label: "Saldo Tersedia", icon: PiggyBank },
  { key: "withdrawn" as const, label: "Sudah Ditarik", icon: Wallet },
  { key: "refunded" as const, label: "Total Refund", icon: Undo2 },
];

export default function DashboardOverview() {
  const { data, isLoading } = useGetDashboard();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((s) => (
            <Skeleton key={s.key} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="p-5">
            <CardContent className="space-y-2 px-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase">{label}</p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="font-heading text-2xl font-extrabold">{formatRupiah(data.balance[key])}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-heading text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            <ClipboardList className="size-4" /> Pesanan Terbaru
          </h3>
          <Card className="p-4">
            <CardContent className="space-y-2 px-0">
              {data.recentOrders.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Belum ada pesanan.</p>
              ) : (
                data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">{order.orderNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{order.customer?.name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-semibold">{formatRupiah(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 font-heading text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
            <AlertTriangle className="size-4" /> Stok Menipis
          </h3>
          <Card className="p-4">
            <CardContent className="space-y-2 px-0">
              {data.lowStockProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">Semua stok aman.</p>
              ) : (
                data.lowStockProducts.map((product) => (
                  <Link
                    key={product.id}
                    href="/admin/products"
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                  >
                    <span className="truncate font-bold">{product.name}</span>
                    <Badge variant={product.stock === 0 ? "destructive" : "warning"}>Stok {product.stock}</Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
