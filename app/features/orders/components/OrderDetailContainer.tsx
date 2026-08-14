"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, FileText, ImageOff, RefreshCw, Wallet, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import SectionHeading from "@/components/shared/SectionHeading";
import { cn, formatRupiah } from "@/lib/utils";
import { useGetOrder } from "../api/getOrder";
import { useCancelOrder } from "../api/cancelOrder";
import { useSyncPayment } from "../api/syncPayment";
import { useMidtransSnap } from "@/app/features/checkout/hooks/useMidtransSnap";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import type { OrderStatus } from "../types/order.type";

const SNAP_EMBED_ID = "midtrans-embed";
const INVOICE_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "completed", "refunded"];

export default function OrderDetailContainer({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useGetOrder(orderId);
  const { embed, isReady } = useMidtransSnap();
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [embedError, setEmbedError] = React.useState(false);
  const embeddedTokenRef = React.useRef<string | null>(null);

  const canPay = !!order && order.status === "pending_payment" && !!order.payment?.snapToken;
  const canCancel = !!order && order.status === "pending_payment";
  const canInvoice = !!order && INVOICE_STATUSES.includes(order.status);
  const paymentFailed = !!order && (order.status === "cancelled" || order.status === "expired");
  const snapToken = order?.payment?.snapToken;

  const cancelMutation = useCancelOrder({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Pesanan dibatalkan");
        setConfirmCancel(false);
      },
      onError: (error) => toast.error(error.message || "Gagal membatalkan pesanan"),
    },
  });

  // Midtrans can't deliver its notification webhook to a localhost dev
  // server (or any environment it can't reach), so this pulls the current
  // status directly instead — same transition logic, just triggered
  // manually rather than waiting on a webhook that may never arrive.
  const syncMutation = useSyncPayment({
    mutationConfig: {
      onSuccess: (updated) => {
        if (updated.status === "pending_payment") toast.info("Status belum berubah — pembayaran belum terkonfirmasi Midtrans.");
        else toast.success("Status pembayaran diperbarui");
      },
      onError: (error) => toast.error(error.message || "Gagal memeriksa status pembayaran"),
    },
  });

  // Embed once per token — re-running on every render would make Snap
  // re-inject its iframe repeatedly. Waits on `isReady` (the snap.js script
  // load) since the container can exist before the SDK itself is ready.
  React.useEffect(() => {
    if (!canPay || !isReady || !snapToken || embeddedTokenRef.current === snapToken) return;
    embeddedTokenRef.current = snapToken;
    setEmbedError(false);
    embed(snapToken, SNAP_EMBED_ID, {
      // `router.refresh()` only re-runs server components — this page's
      // order data is entirely client-fetched via React Query, so it never
      // touched the stale data on screen. Worse, Midtrans's webhook can't
      // reach a localhost dev server, so our own DB row isn't updated yet
      // either at the moment Snap reports success. Pull status the same way
      // the manual "Cek status pembayaran" button does — it hits Midtrans's
      // API directly and writes the real status before refetching.
      onSuccess: () => syncMutation.mutate(order.id),
      onPending: () => syncMutation.mutate(order.id),
      onError: () => {
        toast.error("Pembayaran gagal, silakan coba lagi");
        setEmbedError(true);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPay, isReady, snapToken, embed, order?.id]);

  if (isLoading || !order) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="rounded-2xl p-5">
          <CardContent className="space-y-1 px-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-heading text-lg font-extrabold">{order.orderNumber}</p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <SectionHeading>Status Pesanan</SectionHeading>
          <Card className="rounded-2xl p-5">
            <CardContent className="px-0">
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>
        </div>

        {paymentFailed && (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5 p-5">
            <CardContent className="flex items-start gap-3 px-0">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-destructive">
                  {order.status === "expired" ? "Pembayaran kedaluwarsa" : "Pembayaran dibatalkan"}
                </p>
                <p className="text-sm text-foreground/80">
                  {order.status === "expired"
                    ? "Batas waktu pembayaran untuk pesanan ini sudah lewat."
                    : "Transaksi pembayaran untuk pesanan ini gagal atau dibatalkan."}{" "}
                  Stok produk sudah dikembalikan ke katalog — buat pesanan baru untuk mencoba lagi.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href="/">Belanja Lagi</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {canPay && (
          <div className="space-y-3">
            <SectionHeading>Selesaikan Pembayaran</SectionHeading>
            <Card className="overflow-hidden rounded-2xl p-0">
              {embedError ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <AlertTriangle className="size-6 text-destructive" />
                  <p className="text-sm text-muted-foreground">Gagal memuat metode pembayaran.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      embeddedTokenRef.current = null;
                      setEmbedError(false);
                    }}
                  >
                    <RefreshCw className="size-3.5" /> Coba Lagi
                  </Button>
                </div>
              ) : (
                <div className="relative min-h-[420px] w-full">
                  {!isReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
                      <Wallet className="size-5 animate-pulse" /> Memuat metode pembayaran...
                    </div>
                  )}
                  <div id={SNAP_EMBED_ID} className="w-full" />
                </div>
              )}
            </Card>
            <button
              type="button"
              onClick={() => syncMutation.mutate(order.id)}
              disabled={syncMutation.isPending}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
            >
              <RefreshCw className={cn("size-3.5", syncMutation.isPending && "animate-spin")} />
              {syncMutation.isPending ? "Memeriksa status..." : "Sudah bayar? Cek status pembayaran"}
            </button>
          </div>
        )}

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
          <Card className="rounded-xl p-4">
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
          <Card className="rounded-xl p-4">
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
            </CardContent>
          </Card>
        </div>

        {(canCancel || canInvoice) && (
          <div className="space-y-3">
            <SectionHeading>Aksi</SectionHeading>
            <Card className="rounded-xl p-4">
              <CardContent className="space-y-2 px-0">
                {canInvoice && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/orders/${order.id}/invoice`}>
                      <FileText className="size-4" /> Lihat Invoice
                    </Link>
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
