"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SectionHeading from "@/components/shared/SectionHeading";
import OrderStatusBadge from "@/app/features/orders/components/OrderStatusBadge";
import { useGetOrder } from "@/app/features/orders/api/getOrder";
import { formatRupiah } from "@/lib/utils";
import { useUpdateOrderStatus } from "../api/updateOrderStatus";
import type { OrderStatus } from "@/app/features/orders/types/order.type";

const NEXT_STATUS: Partial<Record<OrderStatus, { status: "processing" | "shipped" | "completed"; label: string }>> = {
  paid: { status: "processing", label: "Proses Pesanan" },
  processing: { status: "shipped", label: "Tandai Dikirim" },
  shipped: { status: "completed", label: "Tandai Selesai" },
};

export default function AdminOrderDetailContainer({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useGetOrder(orderId);
  const [trackingNumber, setTrackingNumber] = React.useState("");

  const updateMutation = useUpdateOrderStatus({
    mutationConfig: {
      onSuccess: () => toast.success("Status pesanan diupdate"),
      onError: (error) => toast.error(error.message || "Gagal mengupdate status"),
    },
  });

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const nextAction = NEXT_STATUS[order.status];
  const canRefund = ["paid", "processing", "shipped", "completed"].includes(order.status);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-5">
          <CardContent className="space-y-1 px-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-heading text-lg font-extrabold">{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString("id-ID")}
              {order.paidAt && ` · Dibayar ${new Date(order.paidAt).toLocaleString("id-ID")}`}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <SectionHeading>Item Pesanan</SectionHeading>
          <div className="space-y-2">
            {order.items.map((item) => (
              <Card key={item.id} className="p-4">
                <CardContent className="flex items-center gap-3 px-0">
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-border/60 bg-muted">
                    {item.productImageUrl ? (
                      <Image src={item.productImageUrl} alt={item.productName} fill className="object-cover" unoptimized />
                    ) : (
                      <ImageOff className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatRupiah(item.subtotal)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <SectionHeading>Pengiriman</SectionHeading>
          <Card className="p-4">
            <CardContent className="space-y-1 px-0 text-sm">
              <p className="font-bold">{order.recipientName}</p>
              <p className="text-muted-foreground">{order.recipientPhone}</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              {order.trackingNumber && (
                <p className="pt-2 font-semibold">No. Resi: {order.trackingNumber}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="h-fit space-y-6 lg:sticky lg:top-6">
        <div className="space-y-3">
          <SectionHeading>Ringkasan</SectionHeading>
          <Card className="p-4">
            <CardContent className="space-y-2 px-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Ongkir{order.courierName ? ` (${order.courierName}${order.courierService ? ` ${order.courierService}` : ""})` : ""}
                </span>
                <span>{formatRupiah(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
              {order.payment && (
                <p className="pt-2 text-xs text-muted-foreground">
                  Pembayaran: {order.payment.paymentType ?? "-"} · {order.payment.status}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {(nextAction || canRefund) && (
          <div className="space-y-3">
            <SectionHeading>Aksi</SectionHeading>
            <Card className="p-4">
              <CardContent className="space-y-3 px-0">
                {nextAction?.status === "shipped" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="tracking">Nomor Resi (opsional)</Label>
                    <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                  </div>
                )}
                {nextAction && (
                  <Button
                    className="w-full"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: order.id,
                        status: nextAction.status,
                        ...(nextAction.status === "shipped" && trackingNumber ? { trackingNumber } : {}),
                      })
                    }
                  >
                    {updateMutation.isPending ? "Memproses..." : nextAction.label}
                  </Button>
                )}
                {canRefund && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ id: order.id, status: "refunded" })}
                  >
                    Refund Pesanan
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
