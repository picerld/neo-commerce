"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronRight, ImageOff, LogIn, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/shared/SectionHeading";
import ErrorState from "@/components/shared/ErrorState";
import { formatRupiah } from "@/lib/utils";
import { ApiError } from "@/lib/http";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useGetProduct } from "../api/getProduct";
import { useGetProducts } from "../api/getProducts";
import { useAddToCart } from "@/app/features/cart/api/addToCart";
import { StarRow } from "@/app/features/reviews/components/ReviewsSection";
import ReviewsSection from "@/app/features/reviews/components/ReviewsSection";
import ProductCard from "./ProductCard";

export default function ProductDetailContainer({ slug }: { slug: string }) {
  const { data: me } = useGetMe();
  const { data: product, isLoading, isError, error, refetch } = useGetProduct(slug);
  const [quantity, setQuantity] = React.useState(1);

  const addToCartMutation = useAddToCart({
    mutationConfig: {
      onSuccess: () => toast.success("Ditambahkan ke keranjang"),
      onError: (error) => toast.error(error.message || "Gagal menambahkan ke keranjang"),
    },
  });

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return notFound ? (
      <ErrorState title="Produk tidak ditemukan" description="Produk ini mungkin sudah dihapus atau tidak lagi tersedia." />
    ) : (
      <ErrorState onRetry={() => refetch()} />
    );
  }

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
    <div className="space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Beranda
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link href={`/search?category=${product.category.slug}`} className="hover:text-foreground">
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
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized priority />
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

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {product.reviewCount > 0 ? (
                <div className="flex items-center gap-1.5">
                  <StarRow rating={product.avgRating} size="size-4" />
                  <span className="font-bold">{product.avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewCount} ulasan)</span>
                </div>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="size-4" /> Belum ada ulasan
                </span>
              )}
              {product.soldCount > 0 && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-muted-foreground">{product.soldCount} terjual</span>
                </>
              )}
            </div>

            <p className="font-heading text-3xl font-extrabold text-primary">{formatRupiah(product.price)}</p>
            <p className="text-sm font-semibold text-muted-foreground">
              {outOfStock ? <span className="text-destructive">Stok habis</span> : `Stok tersedia: ${product.stock}`}
            </p>
          </div>

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

      <div className="space-y-3">
        <SectionHeading>Deskripsi Produk</SectionHeading>
        <Card className="p-5 sm:p-6">
          {product.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{product.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada deskripsi untuk produk ini.</p>
          )}
        </Card>
      </div>

      <div className="space-y-3">
        <SectionHeading>Ulasan Pembeli</SectionHeading>
        <ReviewsSection slug={slug} />
      </div>

      <RelatedProducts categorySlug={product.category?.slug} currentProductId={product.id} />
    </div>
  );
}

function RelatedProducts({ categorySlug, currentProductId }: { categorySlug?: string; currentProductId: string }) {
  const { data: products } = useGetProducts({ params: { categorySlug }, queryConfig: { enabled: !!categorySlug } });
  const related = (products ?? []).filter((p) => p.id !== currentProductId).slice(0, 6);

  if (related.length === 0) return null;

  return (
    <div className="space-y-3">
      <SectionHeading>Produk Serupa</SectionHeading>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
