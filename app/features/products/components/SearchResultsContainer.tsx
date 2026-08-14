"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { cn, formatRupiah } from "@/lib/utils";
import { useGetProducts } from "../api/getProducts";
import { useGetCategories } from "@/app/features/categories/api/getCategories";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlaris", label: "Terlaris" },
  { value: "termurah", label: "Harga Terendah" },
  { value: "termahal", label: "Harga Tertinggi" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export default function SearchResultsContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categorySlug = searchParams.get("category") ?? undefined;
  const sort = (searchParams.get("sort") as SortValue) ?? "terbaru";

  const { data: categories } = useGetCategories();
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useGetProducts({ params: { search: q, categorySlug } });

  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");

  const results = React.useMemo(() => {
    if (!products) return [];
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    const filtered = products.filter((p) => (min === undefined || p.price >= min) && (max === undefined || p.price <= max));

    const sorted = [...filtered];
    if (sort === "terlaris") sorted.sort((a, b) => b.soldCount - a.soldCount);
    else if (sort === "termurah") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "termahal") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [products, minPrice, maxPrice, sort]);

  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  const setParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const heading = q ? `Hasil pencarian untuk "${q}"` : activeCategory ? activeCategory.name : "Semua Produk";
  const hasFilters = !!q || !!categorySlug || !!minPrice || !!maxPrice;

  // Surfaced as removable chips so a shopper can see and clear individual
  // filters at a glance, instead of having to reopen the filter panel just
  // to check what's currently narrowing the results.
  const activeFilters: { key: string; label: string; onRemove: () => void }[] = [];
  if (q) activeFilters.push({ key: "q", label: `"${q}"`, onRemove: () => setParam("q", undefined) });
  if (activeCategory) {
    activeFilters.push({ key: "category", label: activeCategory.name, onRemove: () => setParam("category", undefined) });
  }
  if (minPrice || maxPrice) {
    activeFilters.push({
      key: "price",
      label: `${minPrice ? formatRupiah(Number(minPrice)) : "Rp0"} – ${maxPrice ? formatRupiah(Number(maxPrice)) : "∞"}`,
      onRemove: () => {
        setMinPrice("");
        setMaxPrice("");
      },
    });
  }

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-extrabold tracking-wide text-muted-foreground uppercase">Kategori</p>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setParam("category", undefined)}
            className={cn(
              "w-full rounded-md border-l-3 px-2.5 py-1.5 text-left text-sm font-semibold transition-colors",
              !categorySlug
                ? "border-primary bg-secondary text-secondary-foreground"
                : "border-transparent text-foreground/80 hover:bg-muted",
            )}
          >
            Semua Kategori
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setParam("category", category.slug)}
              className={cn(
                "w-full rounded-md border-l-3 px-2.5 py-1.5 text-left text-sm font-semibold transition-colors",
                categorySlug === category.slug
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-transparent text-foreground/80 hover:bg-muted",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold tracking-wide text-muted-foreground uppercase">Rentang Harga</p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              Rp
            </span>
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-9 pr-2 pl-7 text-sm"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
              Rp
            </span>
            <Input
              type="number"
              min={0}
              placeholder="Maks"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9 pr-2 pl-7 text-sm"
            />
          </div>
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setMinPrice("");
            setMaxPrice("");
            router.push("/search");
          }}
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" /> Reset semua filter
        </button>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in-up grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-10 rounded-2xl border-2 border-border/60 bg-card p-4 shadow-[0_3px_0_0_var(--border)]">{filterPanel}</div>
      </aside>

      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-[0_3px_0_0_var(--primary)]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Search className="size-4.5 text-primary" />
            </span>
            <div>
              <h1 className="font-heading text-lg font-extrabold tracking-tight sm:text-xl">{heading}</h1>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Memuat..." : isError ? "Gagal memuat produk" : `${results.length} produk ditemukan`}
              </p>
            </div>
          </div>

          <details className="lg:hidden">
            <summary className="press-shadow flex cursor-pointer list-none items-center gap-1.5 rounded-full border-2 border-border bg-background px-3 py-1.5 text-xs font-bold shadow-[0_2px_0_0_var(--border)]">
              <SlidersHorizontal className="size-3.5" /> Filter
            </summary>
            <div className="mt-3 rounded-2xl border-2 border-border/60 bg-card p-4 shadow-[0_3px_0_0_var(--border)]">{filterPanel}</div>
          </details>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="gap-1 border-2 border-transparent py-1 pr-1.5 pl-2.5 text-xs font-semibold"
              >
                {filter.label}
                <button
                  type="button"
                  onClick={filter.onRemove}
                  aria-label={`Hapus filter ${filter.label}`}
                  className="flex size-4 items-center justify-center rounded-full hover:bg-black/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="snap-rail flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-border/60 pb-3">
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">Urutkan:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setParam("sort", option.value === "terbaru" ? undefined : option.value)}
              className={cn(
                "shrink-0 rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors active:scale-95",
                sort === option.value ? "border-primary bg-secondary text-secondary-foreground" : "border-border/60 bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4]" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            illustration="/illustrations/not-found.svg"
            title="Produk tidak ditemukan"
            description="Coba kata kunci lain, kategori berbeda, atau ubah rentang harga."
            action={
              <Button size="sm" variant="outline" onClick={() => router.push("/search")}>
                Reset Filter
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
