"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Boxes, ClipboardList, Wallet, LogOut, ChevronsUpDown, ShieldCheck } from "lucide-react";
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

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produk", icon: Boxes },
  { href: "/admin/orders", label: "Pesanan", icon: ClipboardList },
  { href: "/admin/withdrawals", label: "Penarikan", icon: Wallet },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: me } = useGetMe();

  const logoutMutation = useLogout({
    mutationConfig: {
      onSuccess: () => {
        router.push("/login");
        router.refresh();
      },
    },
  });

  const current =
    NAV.find((item) => pathname === item.href) ??
    NAV.find((item) => item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r-2 border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklab,var(--primary),black_18%)]">
            <ShieldCheck className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="font-heading text-base font-extrabold tracking-wide">Neo Commerce</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = current?.href === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center gap-2.5 rounded-lg bg-sidebar-accent px-2.5 py-2 text-sm font-bold text-sidebar-accent-foreground"
                    : "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t-2 border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg border-2 border-border bg-background px-2.5 py-2 text-left shadow-[0_3px_0_0_var(--border)] outline-none transition-all duration-150 hover:bg-muted active:translate-y-0.5 active:shadow-none"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-secondary font-heading text-sm font-extrabold text-secondary-foreground">
                  {me?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-bold">{me?.name ?? "..."}</span>
                  <span className="block truncate text-xs text-muted-foreground">Admin</span>
                </span>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <span className="block text-sm font-bold">{me?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{me?.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                variant="destructive"
                className="justify-center font-bold"
              >
                <LogOut className="size-4" />
                {logoutMutation.isPending ? "Sedang keluar..." : "Keluar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b-2 border-border/60 bg-card/80 px-6 backdrop-blur">
          <h1 className="truncate font-heading text-base font-extrabold tracking-tight uppercase">
            {current?.label ?? "Neo Commerce"}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
