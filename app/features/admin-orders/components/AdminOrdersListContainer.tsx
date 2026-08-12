"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyState from "@/components/shared/EmptyState";
import OrderStatusBadge from "@/app/features/orders/components/OrderStatusBadge";
import { formatRupiah } from "@/lib/utils";
import { useGetAdminOrders } from "../api/getAdminOrders";
import type { OrderStatus } from "@/app/features/orders/types/order.type";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending_payment", label: "Menunggu" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "refunded", label: "Refund" },
];

export default function AdminOrdersListContainer() {
  const [filter, setFilter] = React.useState<OrderStatus | "all">("all");
  const { data: orders, isLoading } = useGetAdminOrders({ status: filter === "all" ? undefined : filter });

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as OrderStatus | "all")}>
        <TabsList className="flex-wrap">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}>
              <Card className="p-4 transition-colors hover:bg-muted/50">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 px-0">
                  <div>
                    <p className="text-sm font-bold">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer?.name} · {order.itemCount} item · {new Date(order.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold">{formatRupiah(order.total)}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState icon={ClipboardList} title="Belum ada pesanan" description="Belum ada pesanan di kategori ini." />
        </Card>
      )}
    </div>
  );
}
