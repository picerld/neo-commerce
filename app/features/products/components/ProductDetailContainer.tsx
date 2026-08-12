"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronRight, ImageOff, LogIn, Minus, Plus, ShieldCheck, ShoppingCart, Truck, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useGetProduct } from "../api/getProduct";
import { useAddToCart } from "@/app/features/cart/api/addToCart";

export default function ProductDetailContainer({ slug }: { slug: string }) {
  const { data: me } = useGetMe();
  const { data: product, isLoading } = useGetProduct(slug);
  const [quantity, setQuantity] = React.useState(1);

  const addToCartMutation = useAddToCart({
    mutationConfig: {
      onSuccess: () => toast.success("Ditambahkan ke keranjang"),
      onError: (error) => toast.error(error.message || "Gagal menambahkan ke keranjang"),
    },
  });

  if (isLoading || !product) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Beranda
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link href={`/?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="truncate text-foreground/80">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="aspect-square overflow-hidden p-0">
          <div className="relative h-full w-full bg-muted">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="size-10 text-muted-foreground" />
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <div className="space-y-2">
            {product.category && (
              <Badge variant="outline" className="w-fit">
                {product.category.name}
              </Badge>
            )}
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">{product.name}</h1>
            <p className="font-heading text-3xl font-extrabold text-primary">{formatRupiah(product.price)}</p>
            <p className="text-sm font-semibold text-muted-foreground">
              {outOfStock ? <span className="text-destructive">Stok habis</span> : `Stok tersedia: ${product.stock}`}
              {product.soldCount > 0 && ` · ${product.soldCount} terjual`}
            </p>
          </div>

          {product.description && <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>}

          {!outOfStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border-2 border-border shadow-[0_2px_0_0_var(--border)]">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {me ? (
            <Button
              className="w-full"
              size="lg"
              disabled={outOfStock || addToCartMutation.isPending}
              onClick={() => addToCartMutation.mutate({ productId: product.id, quantity })}
            >
              <ShoppingCart className="size-4" />
              {addToCartMutation.isPending ? "Menambahkan..." : outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
            </Button>
          ) : (
            <Button asChild className="w-full" size="lg">
              <Link href="/login">
                <LogIn className="size-4" /> Masuk untuk Membeli
              </Link>
            </Button>
          )}

          <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center text-[11px] font-semibold text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="size-4 text-primary" />
              Pembayaran Aman
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="size-4 text-primary" />
              Lacak Pesanan
            </div>
            <div className="flex flex-col items-center gap-1">
              <Undo2 className="size-4 text-primary" />
              Bisa Dibatalkan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
