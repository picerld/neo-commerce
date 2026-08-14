"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Flame, PackageSearch, Sparkles, Star, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProducts } from "../api/getProducts";
import RecentReviewsSection from "@/app/features/reviews/components/RecentReviewsSection";
import ProductCard from "./ProductCard";
import CategoryIconStrip from "./CategoryIconStrip";
import HeroBanner from "./HeroBanner";
import type { ProductSummary } from "../types/product.type";

const PREVIEW_LIMIT = 12;
const RAIL_SIZE = 8;
// Below this, deduping the "Semua Produk" grid against the rails above
// would leave it looking sparse/broken — better to show the full set and
// accept a little repetition than an anemic section.
const MIN_PREVIEW_AFTER_DEDUPE = 6;

const RAIL_ACCENTS = {
  destructive: { iconBg: "bg-destructive/10", iconColor: "text-destructive", link: "text-destructive hover:text-destructive/80" },
  primary: { iconBg: "bg-primary/10", iconColor: "text-primary", link: "text-primary hover:text-primary/80" },
  warning: { iconBg: "bg-warning/15", iconColor: "text-warning", link: "text-warning hover:text-warning/80" },
} as const;

function ProductRail({
  title,
  icon: Icon,
  subtitle,
  href,
  accent,
  products,
  markNew = false,
  featured = false,
}: {
  title: string;
  icon: LucideIcon;
  subtitle: string;
  href: string;
  accent: keyof typeof RAIL_ACCENTS;
  products: ProductSummary[];
  markNew?: boolean;
  featured?: boolean;
}) {
  const styles = RAIL_ACCENTS[accent];
  return (
    <div className="animate-fade-in-up space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10", styles.iconBg)}>
            <Icon className={cn("size-4.5 sm:size-5", styles.iconColor)} />
          </span>
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-extrabold tracking-tight sm:text-base">{title}</h2>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Link
          href={href}
          className={cn(
            "group/link flex shrink-0 items-center gap-1 text-[11px] font-semibold transition-transform sm:text-xs",
            styles.link,
          )}
        >
          Lihat Semua <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
      <div className="snap-rail flex gap-3 overflow-x-auto pb-1">
        {products.map((product, i) => (
          <div
            key={product.id}
            className={cn("animate-fade-in-up", featured ? "w-40 shrink-0 sm:w-48" : "w-36 shrink-0 sm:w-44")}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <ProductCard product={product} isNew={markNew} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPageContainer() {
  const { data: products, isLoading, isError, refetch } = useGetProducts();

  const newest = React.useMemo(() => (products ?? []).slice(0, RAIL_SIZE), [products]);
  const newestIds = React.useMemo(() => new Set(newest.map((p) => p.id)), [newest]);

  const bestSellers = React.useMemo(() => {
    if (!products) return [];
    return [...products]
      .filter((p) => p.soldCount > 0 && !newestIds.has(p.id))
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, RAIL_SIZE);
  }, [products, newestIds]);
  const bestSellerIds = React.useMemo(() => new Set(bestSellers.map((p) => p.id)), [bestSellers]);

  const topRated = React.useMemo(() => {
    if (!products) return [];
    return [...products]
      .filter((p) => p.reviewCount > 0 && !newestIds.has(p.id) && !bestSellerIds.has(p.id))
      .sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount)
      .slice(0, RAIL_SIZE);
  }, [products, newestIds, bestSellerIds]);
  const topRatedIds = React.useMemo(() => new Set(topRated.map((p) => p.id)), [topRated]);

  // "Semua Produk" should feel like it's surfacing the rest of the catalog,
  // not repeating what's already featured above — but never go so sparse
  // it looks broken.
  const preview = React.useMemo(() => {
    if (!products) return undefined;
    const rest = products.filter((p) => !newestIds.has(p.id) && !bestSellerIds.has(p.id) && !topRatedIds.has(p.id));
    const source = rest.length >= MIN_PREVIEW_AFTER_DEDUPE ? rest : products;
    return source.slice(0, PREVIEW_LIMIT);
  }, [products, newestIds, bestSellerIds, topRatedIds]);

  if (isError) {
    return <ErrorState title="Gagal memuat halaman" description="Coba muat ulang halaman ini." onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-8">
      <HeroBanner />

      <CategoryIconStrip />

      {newest.length > 0 && (
        <ProductRail
          title="Baru Tiba"
          icon={Sparkles}
          subtitle="Produk-produk terbaru yang baru ditambahkan ke katalog"
          href="/search"
          accent="primary"
          products={newest}
          markNew
          featured
        />
      )}

      {bestSellers.length > 0 && (
        <ProductRail
          title="Produk Terlaris"
          icon={Flame}
          subtitle="Paling banyak diminati pembeli"
          href="/search?sort=terlaris"
          accent="destructive"
          products={bestSellers}
        />
      )}

      {topRated.length > 0 && (
        <ProductRail
          title="Rating Tertinggi"
          icon={Star}
          subtitle="Direkomendasikan berdasarkan ulasan pembeli"
          href="/search"
          accent="warning"
          products={topRated}
        />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-extrabold tracking-tight">Semua Produk</h2>
          <Link href="/search" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            Lihat Semua <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        ) : preview && preview.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {preview.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="Belum ada produk"
            description="Produk akan muncul di sini setelah admin menambahkannya."
            action={
              <Button size="sm" variant="outline" asChild>
                <Link href="/search">Jelajahi Katalog</Link>
              </Button>
            }
          />
        )}
      </div>

      <RecentReviewsSection />
    </div>
  );
}
