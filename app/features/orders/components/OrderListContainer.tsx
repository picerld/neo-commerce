"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { formatRupiah } from "@/lib/utils";
import { useGetOrders } from "../api/getOrders";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderListContainer() {
  const { data: orders, isLoading } = useGetOrders();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="Kamu belum punya pesanan"
          description="Semua pesanan yang kamu buat akan muncul di sini."
          action={
            <Button asChild size="sm">
              <Link href="/">Mulai Belanja</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <Link key={order.id} href={`/orders/${order.id}`}>
          <Card className="p-4 transition-colors hover:bg-muted/50">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 px-0">
              <div>
                <p className="text-sm font-bold">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {order.itemCount} item · {new Date(order.createdAt).toLocaleDateString("id-ID")}
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
  );
}
