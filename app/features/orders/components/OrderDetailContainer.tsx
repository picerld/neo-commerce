"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageOff, CreditCard, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SectionHeading from "@/components/shared/SectionHeading";
import { formatRupiah } from "@/lib/utils";
import { useGetOrder } from "../api/getOrder";
import { useCancelOrder } from "../api/cancelOrder";
import { useMidtransSnap } from "@/app/features/checkout/hooks/useMidtransSnap";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderDetailContainer({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading } = useGetOrder(orderId);
  const { pay } = useMidtransSnap();
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  const cancelMutation = useCancelOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Pesanan dibatalkan");
        setConfirmCancel(false);
      },
      onError: (error) => toast.error(error.message || "Gagal membatalkan pesanan"),
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

  const canPay = order.status === "pending_payment" && order.payment?.snapToken;
  const canCancel = order.status === "pending_payment";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="p-5">
          <CardContent className="space-y-1 px-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-heading text-lg font-extrabold">{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
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
              {order.trackingNumber && <p className="pt-2 font-semibold">No. Resi: {order.trackingNumber}</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="h-fit space-y-6 lg:sticky lg:top-20">
        <div className="space-y-3">
          <SectionHeading>Ringkasan</SectionHeading>
          <Card className="p-4">
            <CardContent className="space-y-2 px-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkir</span>
                <span>{formatRupiah(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {(canPay || canCancel) && (
          <div className="space-y-3">
            <SectionHeading>Aksi</SectionHeading>
            <Card className="p-4">
              <CardContent className="space-y-2 px-0">
                {canPay && (
                  <Button
                    className="w-full"
                    onClick={() =>
                      pay(order.payment!.snapToken as string, {
                        onSuccess: () => router.refresh(),
                        onPending: () => router.refresh(),
                        onError: () => toast.error("Pembayaran gagal, silakan coba lagi"),
                      })
                    }
                  >
                    <CreditCard className="size-4" /> Lanjutkan Pembayaran
                  </Button>
                )}
                {canCancel && (
                  <Button variant="outline" className="w-full" onClick={() => setConfirmCancel(true)}>
                    <XCircle className="size-4" /> Batalkan Pesanan
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Batalkan pesanan ini?"
        description="Stok produk akan dikembalikan. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Batalkan Pesanan"
        isPending={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate(order.id)}
      />
    </div>
  );
}
