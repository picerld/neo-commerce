"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, CreditCard, ImageOff, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { cn, formatRupiah } from "@/lib/utils";
import { useGetOrders } from "../api/getOrders";
import OrderStatusBadge from "./OrderStatusBadge";
import type { OrderStatus, OrderSummary } from "../types/order.type";

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending_payment", label: "Menunggu Pembayaran" },
  { value: "paid", label: "Dibayar" },
  { value: "processing", label: "Diproses" },
  { value: "shipped", label: "Dikirim" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function OrderListContainer() {
  const { data: orders, isLoading } = useGetOrders();
  const [filter, setFilter] = React.useState<OrderStatus | "all">("all");

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
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

  const counts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});
  const filtered = filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return (
    <div className="space-y-4">
      <div className="snap-rail flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => {
          const count = item.value === "all" ? orders.length : (counts[item.value] ?? 0);
          if (item.value !== "all" && count === 0) return null;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "shrink-0 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors active:scale-95",
                filter === item.value
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-border/60 bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {item.label} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Package} title="Tidak ada pesanan" description="Tidak ada pesanan dengan status ini." />
        </Card>
      ) : (
        <div className="animate-fade-in-up space-y-2">
          {filtered.map((order, i) => (
            <OrderRow key={order.id} order={order} delay={Math.min(i, 10) * 30} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, delay }: { order: OrderSummary; delay: number }) {
  const extraItems = order.itemCount - 1;

  return (
    <Card className="press-shadow animate-fade-in-up overflow-hidden rounded-2xl p-0" style={{ animationDelay: `${delay}ms` }}>
      <Link href={`/orders/${order.id}`} className="block hover:bg-muted/50">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-border/60 bg-muted">
            {order.previewImageUrl ? (
              <Image src={order.previewImageUrl} alt={order.previewProductName ?? order.orderNumber} fill className="object-cover" unoptimized />
            ) : (
              <ImageOff className="size-5 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-bold">{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="truncate text-sm text-foreground/80">
              {order.previewProductName}
              {extraItems > 0 && <span className="text-muted-foreground"> +{extraItems} produk lainnya</span>}
            </p>
            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="font-heading text-sm font-extrabold text-primary">{formatRupiah(order.total)}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Link>

      {order.status === "pending_payment" && (
        <div className="border-t border-border/60 bg-warning/5 px-4 py-2.5">
          <Button asChild size="sm" className="w-full">
            <Link href={`/orders/${order.id}`}>
              <CreditCard className="size-3.5" /> Selesaikan Pembayaran
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
