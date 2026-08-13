"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Search, ShoppingCart, LogOut, Package, ChevronsUpDown, ShieldCheck, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useLogout } from "@/app/features/auth/api/logout";
import { useGetCart } from "@/app/features/cart/api/getCart";
import { useGetCategories } from "@/app/features/categories/api/getCategories";

export default function StorefrontHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: me, isLoading: meLoading } = useGetMe();
  const { data: cart } = useGetCart({ queryConfig: { enabled: !!me } });
  const { data: categories } = useGetCategories();

  const isSearchPage = pathname === "/search";

  // Keeps the search box in sync with the URL (e.g. after a nav or back/
  // forward) without an effect — React's recommended pattern for adjusting
  // state during render in response to a prop/derived-value change.
  const searchFromUrl = isSearchPage ? (searchParams.get("q") ?? "") : "";
  const [search, setSearch] = React.useState(searchFromUrl);
  const [syncedSearch, setSyncedSearch] = React.useState(searchFromUrl);
  if (searchFromUrl !== syncedSearch) {
    setSyncedSearch(searchFromUrl);
    setSearch(searchFromUrl);
  }

  const activeCategory = isSearchPage ? (searchParams.get("category") ?? undefined) : undefined;

  const logoutMutation = useLogout({
    mutationConfig: {
      onSuccess: () => {
        router.push("/login");
        router.refresh();
      },
    },
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border/60 bg-primary text-primary-foreground">
      {/* Slim trust strip — mirrors Tokopedia's thin utility bar above the
          main header row; hidden on mobile to keep the header compact. */}
      <div className="hidden border-b border-white/10 bg-[color-mix(in_oklab,var(--primary),black_15%)] sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] font-semibold text-primary-foreground/75 md:px-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3" /> Belanja aman & nyaman di Neo Commerce
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="size-3" /> Lacak pesananmu real-time
          </span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:gap-6 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <ShoppingBag className="size-4.5" />
          </div>
          <span className="hidden font-heading text-base font-extrabold tracking-tight sm:inline">Neo Commerce</span>
        </Link>

        <form onSubmit={handleSearch} className="min-w-0 flex-1">
          <div className="flex h-10 items-stretch overflow-hidden rounded-lg border-2 border-transparent bg-white shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary),black_30%)] transition-colors focus-within:border-white">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari di Neo Commerce"
              className="h-full flex-1 rounded-none border-transparent bg-transparent text-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0"
            />
            <button
              type="submit"
              aria-label="Cari"
              className="flex w-12 shrink-0 items-center justify-center bg-[color-mix(in_oklab,var(--primary),black_12%)] text-primary-foreground transition-colors hover:brightness-110"
            >
              <Search className="size-4" />
            </button>
          </div>
        </form>

        <div className="flex shrink-0 items-center gap-2">
          {meLoading ? (
            <Skeleton className="h-10 w-24 bg-white/15" />
          ) : me ? (
            <>
              <Link
                href="/cart"
                className="relative flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
                aria-label="Keranjang"
              >
                <ShoppingCart className="size-5" />
                {!!cart?.itemCount && (
                  <span className="absolute top-0.5 right-0.5 flex size-4.5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {cart.itemCount > 9 ? "9+" : cart.itemCount}
                  </span>
                )}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="cursor-pointer hidden items-center gap-1.5 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-white/10 sm:flex"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-extrabold">
                      {me.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="max-w-24 truncate text-sm font-bold">{me.name}</span>
                    <ChevronsUpDown className="size-3.5 shrink-0 opacity-80" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <span className="block text-sm font-bold">{me.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{me.email}</span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserRound className="size-4" /> Profil Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">
                      <Package className="size-4" /> Pesanan Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={logoutMutation.isPending}
                    onClick={() => logoutMutation.mutate()}
                    variant="destructive"
                  >
                    <LogOut className="size-4" />
                    {logoutMutation.isPending ? "Sedang keluar..." : "Keluar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Category quick-nav lives on its own neutral bar (not the solid
          primary field) so the header reads lighter overall — Tokopedia
          keeps category access one click away from every page, not just
          the homepage. */}
      {!!categories?.length && (
        <div className="border-t border-border/60 bg-card">
          <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 text-foreground md:px-6">
            <Link
              href="/search"
              className={cn(
                "shrink-0 rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                isSearchPage && !activeCategory ? "bg-secondary text-secondary-foreground font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              Semua
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                  activeCategory === category.slug ? "bg-secondary text-secondary-foreground font-bold" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
