"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, UserRound, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useGetCart } from "@/app/features/cart/api/getCart";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { data: me } = useGetMe();
  const { data: cart } = useGetCart({ queryConfig: { enabled: !!me } });

  const tabs = [
    { href: "/", label: "Beranda", icon: Home, active: pathname === "/" },
    { href: "/search", label: "Kategori", icon: LayoutGrid, active: pathname.startsWith("/search") },
    {
      href: "/cart",
      label: "Keranjang",
      icon: ShoppingCart,
      active: pathname.startsWith("/cart"),
      badge: cart?.itemCount ? (cart.itemCount > 9 ? "9+" : cart.itemCount) : undefined,
    },
    me
      ? { href: "/profile", label: "Akun", icon: UserRound, active: pathname.startsWith("/profile") }
      : { href: "/login", label: "Akun", icon: LogIn, active: pathname.startsWith("/login") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
      aria-label="Navigasi utama"
    >
      <div className="mx-auto flex max-w-7xl items-stretch px-1.5 py-1.5">
        {tabs.map(({ href, label, icon: Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "press-shadow relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors duration-150",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "relative flex size-9 items-center justify-center rounded-full transition-colors duration-150",
                active && "bg-primary/12",
              )}
            >
              <Icon className={cn("size-5 transition-transform duration-150", active && "scale-110")} />
              {!!badge && (
                <span className="absolute -top-1 -right-1 flex size-4.5 animate-pop-in items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
