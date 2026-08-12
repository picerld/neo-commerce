"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, PackageSearch, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "../api/getProducts";
import ProductCard from "./ProductCard";
import CategoryIconStrip from "./CategoryIconStrip";
import HeroBanner from "./HeroBanner";

export default function LandingPageContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const categorySlug = searchParams.get("category") ?? undefined;

  const { data: products, isLoading } = useGetProducts({ params: { search, categorySlug } });

  const isFiltered = !!search || !!categorySlug;

  const bestSellers = React.useMemo(() => {
    if (isFiltered || !products) return [];
    return [...products]
      .filter((p) => p.soldCount > 0)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 6);
  }, [isFiltered, products]);

  const setCategory = (slug: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  };

  return (
    <div className="space-y-8">
      {!isFiltered && <HeroBanner />}

      <CategoryIconStrip activeSlug={categorySlug} onSelect={setCategory} />

      {bestSellers.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-1.5 font-heading text-lg font-extrabold tracking-tight">
            <Flame className="size-5 text-destructive" /> Produk Terlaris
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-extrabold tracking-tight">
            {search ? `Hasil untuk "${search}"` : categorySlug ? "Produk Kategori Ini" : "Semua Produk"}
          </h2>
          {isFiltered && (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" /> Reset filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PackageSearch}
            title="Produk tidak ditemukan"
            description="Coba kata kunci lain atau jelajahi kategori berbeda."
            action={
              isFiltered ? (
                <Button size="sm" variant="outline" onClick={() => router.push("/")}>
                  Reset Filter
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
