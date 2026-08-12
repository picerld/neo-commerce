"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ImageOff, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/shared/SectionHeading";
import EmptyState from "@/components/shared/EmptyState";
import { formatRupiah } from "@/lib/utils";
import { useGetCart } from "../api/getCart";
import { useUpdateCartItem } from "../api/updateCartItem";
import { useRemoveCartItem } from "../api/removeCartItem";

export default function CartContainer() {
  const { data: cart, isLoading } = useGetCart();

  const updateMutation = useUpdateCartItem({
    mutationConfig: { onError: (error) => toast.error(error.message || "Gagal mengupdate keranjang") },
  });
  const removeMutation = useRemoveCartItem({
    mutationConfig: { onError: (error) => toast.error(error.message || "Gagal menghapus item") },
  });

  if (isLoading || !cart) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={ShoppingBag}
          title="Keranjangmu masih kosong"
          description="Yuk mulai belanja dan temukan produk favoritmu."
          action={
            <Button asChild size="sm">
              <Link href="/">Mulai Belanja</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const hasBlockingIssue = cart.items.some((item) => !item.isActive || item.quantity > item.stock);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-2 lg:col-span-2">
        {cart.items.map((item) => {
          const issue = !item.isActive ? "Produk tidak lagi tersedia" : item.quantity > item.stock ? `Stok hanya tersisa ${item.stock}` : null;
          return (
            <Card key={item.id} className="p-4">
              <CardContent className="flex flex-wrap items-center gap-3 px-0">
                <Link href={`/products/${item.productSlug}`} className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-border/60 bg-muted">
                  {item.productImageUrl ? (
                    <Image src={item.productImageUrl} alt={item.productName} fill className="object-cover" unoptimized />
                  ) : (
                    <ImageOff className="size-5 text-muted-foreground" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.productSlug}`} className="truncate text-sm font-bold hover:underline">
                    {item.productName}
                  </Link>
                  <p className="text-sm text-muted-foreground">{formatRupiah(item.price)}</p>
                  {issue && (
                    <Badge variant="destructive" className="mt-1">
                      {issue}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center rounded-lg border-2 border-border shadow-[0_2px_0_0_var(--border)]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={item.quantity <= 1 || updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={item.quantity >= item.stock || updateMutation.isPending}
                    onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>

                <p className="w-28 shrink-0 text-right text-sm font-bold">{formatRupiah(item.subtotal)}</p>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(item.id)}
                  aria-label="Hapus item"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="h-fit space-y-3 lg:sticky lg:top-20">
        <SectionHeading>Ringkasan</SectionHeading>
        <Card className="p-5">
          <CardContent className="space-y-4 px-0">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">{formatRupiah(cart.total)}</span>
            </div>
            {hasBlockingIssue && (
              <p className="text-xs text-destructive">Perbaiki item yang bermasalah sebelum checkout.</p>
            )}
            <Button asChild className="w-full" size="lg" disabled={hasBlockingIssue}>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
