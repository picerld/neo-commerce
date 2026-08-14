"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  ImageOff,
  LogIn,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  Undo2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import type { ProductSummary } from "../types/product.type";

export default function ProductDetailContainer({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { data: product, isLoading, isError, error, refetch } = useGetProduct(slug);
  const [quantity, setQuantity] = React.useState(1);

  const addToCartMutation = useAddToCart({
    mutationConfig: {
      onSuccess: () => toast.success("Ditambahkan ke keranjang"),
      onError: (error) => toast.error(error.message || "Gagal menambahkan ke keranjang"),
    },
  });

  // Separate mutation instance (rather than reusing addToCartMutation) so
  // "Beli Langsung" gets its own pending state and skips the "added to
  // cart" toast — the user's intent here is "buy", not "add to cart".
  const buyNowMutation = useAddToCart({
    mutationConfig: {
      onSuccess: () => router.push("/checkout"),
      onError: (error) => toast.error(error.message || "Gagal memproses pembelian"),
    },
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url });
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Tautan produk disalin");
  };

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
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_320px]">
        <Skeleton className="aspect-square" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-56" />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.compareAtPrice!) * 100) : 0;
  const subtotal = product.price * quantity;

  return (
    <div className="animate-fade-in-up space-y-8 pb-20 lg:pb-0">
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_320px] lg:items-start">
        {/* Image */}
        <Card className="aspect-square overflow-hidden rounded-3xl p-0">
          <div className="relative h-full w-full bg-muted">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized priority />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="size-10 text-muted-foreground" />
              </div>
            )}
            {!outOfStock && hasDiscount && (
              <Badge className="absolute top-3 left-3 border-transparent bg-gradient-to-r from-destructive to-[#ff6b6b] text-sm text-destructive-foreground shadow-sm">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </Card>

        {/* Info + tabs */}
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

            {hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-base text-muted-foreground line-through">{formatRupiah(product.compareAtPrice!)}</span>
                <Badge variant="destructive">-{discountPercent}%</Badge>
              </div>
            )}
            <p className="font-heading text-3xl font-extrabold text-primary">{formatRupiah(product.price)}</p>
          </div>

          <Tabs defaultValue="deskripsi">
            <TabsList className="h-10 w-full justify-start gap-1 bg-muted p-1">
              <TabsTrigger value="deskripsi" className="flex-none px-4">
                Deskripsi
              </TabsTrigger>
              <TabsTrigger value="spesifikasi" className="flex-none px-4">
                Spesifikasi
              </TabsTrigger>
              <TabsTrigger value="ulasan" className="flex-none px-4">
                Ulasan ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deskripsi" className="pt-4">
              <Card className="p-5">
                {product.description ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/80">{product.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada deskripsi untuk produk ini.</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="spesifikasi" className="pt-4">
              <Card className="gap-0 divide-y divide-border/60 p-0">
                {[
                  { label: "Kategori", value: product.category?.name ?? "Tanpa kategori" },
                  { label: "Stok tersedia", value: outOfStock ? "Habis" : `${product.stock} unit` },
                  { label: "Kondisi", value: "Baru" },
                  { label: "Ditambahkan", value: new Date(product.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold text-foreground/90">{row.value}</span>
                  </div>
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="ulasan" className="pt-4">
              <ReviewsSection slug={slug} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Purchase card — desktop only; mobile uses the sticky bottom bar
            below so the primary action stays thumb-reachable there instead
            of duplicating it in a second control. */}
        <Card className="hidden rounded-2xl p-5 lg:sticky lg:top-20 lg:block">
          <p className="font-heading text-sm font-extrabold tracking-tight">Atur Jumlah</p>

          {!outOfStock ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center rounded-lg border-2 border-border shadow-[0_2px_0_0_var(--border)]">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
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
              <span className="text-xs font-semibold text-muted-foreground">Stok: {product.stock}</span>
            </div>
          ) : (
            <p className="text-sm font-semibold text-destructive">Stok habis</p>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-heading text-lg font-extrabold text-primary">{formatRupiah(subtotal)}</span>
          </div>

          {me ? (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                disabled={outOfStock || addToCartMutation.isPending}
                onClick={() => addToCartMutation.mutate({ productId: product.id, quantity })}
              >
                <ShoppingCart className="size-4" />
                {addToCartMutation.isPending ? "Menambahkan..." : "+ Keranjang"}
              </Button>
              <Button
                className="w-full"
                size="lg"
                disabled={outOfStock || buyNowMutation.isPending}
                onClick={() => buyNowMutation.mutate({ productId: product.id, quantity })}
              >
                <ShoppingBag className="size-4" />
                {buyNowMutation.isPending ? "Memproses..." : outOfStock ? "Stok Habis" : "Beli Langsung"}
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full" size="lg">
              <Link href="/login">
                <LogIn className="size-4" /> Masuk untuk Membeli
              </Link>
            </Button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 pt-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <Share2 className="size-3.5" /> Bagikan Produk
          </button>

          <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center text-[11px] font-semibold text-muted-foreground">
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
        </Card>
      </div>

      {/* Sticky mobile add-to-cart bar — keeps the primary action within
          thumb reach while scrolling description/reviews, matching the
          pattern shoppers already know from Tokopedia/Shopee's PDP. Sits
          just above MobileBottomNav (which reserves bottom-16 via ShopShell). */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t-2 border-border/60 bg-card/95 p-3 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">Harga</p>
            <p className="truncate font-heading text-base font-extrabold text-primary">{formatRupiah(product.price)}</p>
          </div>
          {me ? (
            <Button
              size="lg"
              className="press-shadow shrink-0"
              disabled={outOfStock || addToCartMutation.isPending}
              onClick={() => addToCartMutation.mutate({ productId: product.id, quantity })}
            >
              <ShoppingCart className="size-4" />
              {addToCartMutation.isPending ? "..." : outOfStock ? "Stok Habis" : "Tambah"}
            </Button>
          ) : (
            <Button asChild size="lg" className="shrink-0">
              <Link href="/login">
                <LogIn className="size-4" /> Masuk
              </Link>
            </Button>
          )}
        </div>
      </div>

      <RelatedProducts categorySlug={product.category?.slug} currentProductId={product.id} />
    </div>
  );
}

function RelatedProducts({ categorySlug, currentProductId }: { categorySlug?: string; currentProductId: string }) {
  const { data: products } = useGetProducts({ params: { categorySlug }, queryConfig: { enabled: !!categorySlug } });
  const related = (products ?? []).filter((p: ProductSummary) => p.id !== currentProductId).slice(0, 6);

  if (related.length === 0) return null;

  return (
    <div className="space-y-3">
      <SectionHeading>Produk Serupa</SectionHeading>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {related.map((product: ProductSummary) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
