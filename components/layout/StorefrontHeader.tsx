"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, LogOut, Package, ChevronsUpDown, ShieldCheck, Truck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/shared/Logo";
import HeaderSearchBar from "./HeaderSearchBar";
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
  const activeCategory = isSearchPage ? (searchParams.get("category") ?? undefined) : undefined;

  const logoutMutation = useLogout({
    mutationConfig: {
      onSuccess: () => {
        router.push("/login");
        router.refresh();
      },
    },
  });

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
        <Link href="/" className="shrink-0">
          <Logo wordmarkClassName="hidden sm:inline" />
        </Link>

        <HeaderSearchBar />

        <div className="flex shrink-0 items-center gap-2">
          {meLoading ? (
            <Skeleton className="h-10 w-24 bg-white/15" />
          ) : me ? (
            <>
              <Link
                href="/cart"
                className="relative flex size-10 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-white/10 active:scale-90"
                aria-label="Keranjang"
              >
                <ShoppingCart className="size-5" />
                {!!cart?.itemCount && (
                  <span className="absolute top-0.5 right-0.5 flex size-4.5 animate-pop-in items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
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
                "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors active:scale-95",
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
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors active:scale-95",
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
