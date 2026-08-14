"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/shared/ErrorState";
import Logo from "@/components/shared/Logo";
import { formatRupiah } from "@/lib/utils";
import { useGetOrder } from "../api/getOrder";
import { useGetMe } from "@/app/features/auth/api/getMe";
import OrderStatusBadge from "./OrderStatusBadge";

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function InvoiceView({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError, refetch } = useGetOrder(orderId);
  const { data: me } = useGetMe();

  if (isError) return <ErrorState title="Gagal memuat invoice" onRetry={() => refetch()} />;

  if (isLoading || !order) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${order.id}`}>
            <ArrowLeft className="size-4" /> Kembali
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="size-4" /> Cetak / Simpan PDF
        </Button>
      </div>

      <div className="rounded-2xl border-2 border-border/60 bg-card p-6 shadow-[0_3px_0_0_var(--border)] sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-6">
          <Logo size="md" />
          <div className="text-right">
            <p className="font-heading text-xl font-extrabold tracking-tight">INVOICE</p>
            <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div className="space-y-0.5">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Ditagihkan Kepada</p>
            <p className="text-sm font-bold text-foreground">{order.recipientName}</p>
            {me?.email && <p className="text-sm text-muted-foreground">{me.email}</p>}
            <p className="text-sm text-muted-foreground">{order.recipientPhone}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          </div>
          <div className="space-y-0.5 sm:text-right">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Detail Pesanan</p>
            <p className="text-sm">
              <span className="text-muted-foreground">Tanggal: </span>
              {dateFmt(order.createdAt)}
            </p>
            <p className="flex items-center gap-1.5 text-sm sm:justify-end">
              <span className="text-muted-foreground">Status:</span> <OrderStatusBadge status={order.status} />
            </p>
            {order.paidAt && (
              <p className="text-sm">
                <span className="text-muted-foreground">Dibayar: </span>
                {dateFmt(order.paidAt)}
              </p>
            )}
            {order.courierName && (
              <p className="text-sm">
                <span className="text-muted-foreground">Kurir: </span>
                {order.courierName} {order.courierService}
              </p>
            )}
            {order.trackingNumber && (
              <p className="text-sm">
                <span className="text-muted-foreground">No. Resi: </span>
                {order.trackingNumber}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-t border-border/60 text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <th className="py-3 font-bold">Produk</th>
                <th className="py-3 text-right font-bold">Harga</th>
                <th className="py-3 text-right font-bold">Qty</th>
                <th className="py-3 text-right font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border/60">
                  <td className="py-3 pr-2 font-medium">{item.productName}</td>
                  <td className="py-3 text-right whitespace-nowrap">{formatRupiah(item.price)}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right font-semibold whitespace-nowrap">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span>{formatRupiah(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-border/60 pt-2 text-base font-extrabold">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(order.total)}</span>
          </div>
        </div>

        <p className="mt-8 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          Invoice ini dibuat otomatis oleh Neo Commerce dan sah tanpa tanda tangan. Pembayaran diproses aman oleh Midtrans.
        </p>
      </div>
    </div>
  );
}
