"use client";

import Link from "next/link";
import { ShieldCheck, Truck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/shared/Logo";
import { useGetCategories } from "@/app/features/categories/api/getCategories";
import { useGetMe } from "@/app/features/auth/api/getMe";

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Pembayaran aman lewat Midtrans" },
  { icon: Truck, text: "Lacak status pesananmu real-time" },
  { icon: Wallet, text: "Riwayat transaksi transparan" },
];

const BANK_METHODS = ["BCA", "Mandiri", "BNI", "BRI"];
const EWALLET_METHODS = ["GoPay", "OVO", "DANA", "QRIS"];

export default function StorefrontFooter() {
  const { data: categories } = useGetCategories();
  const { data: me } = useGetMe();

  return (
    <footer className="border-t-2 border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-3 rounded-3xl border-2 border-border/60 bg-background p-5 shadow-[0_3px_0_0_var(--border)] sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
              <p className="text-sm font-semibold text-foreground/80">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-10 md:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 space-y-2 sm:col-span-1">
            <Link href="/" className="inline-flex">
              <Logo size="sm" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Belanja online terpercaya — pembayaran terenkripsi lewat Midtrans, pesanan dikemas rapi, dan status
              kirimanmu bisa dipantau sampai depan pintu.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Belanja</p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link href="/" className="text-foreground/80 hover:text-primary">
                  Beranda
                </Link>
              </li>
              {categories?.map((category) => (
                <li key={category.id}>
                  <Link href={`/?category=${category.slug}`} className="text-foreground/80 hover:text-primary">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Akun Saya</p>
            <ul className="space-y-1.5 text-sm">
              {me ? (
                <>
                  <li>
                    <Link href="/cart" className="text-foreground/80 hover:text-primary">
                      Keranjang
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="text-foreground/80 hover:text-primary">
                      Pesanan Saya
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-foreground/80 hover:text-primary">
                      Masuk
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-foreground/80 hover:text-primary">
                      Daftar
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Transfer Bank</p>
              <div className="flex flex-wrap gap-1.5">
                {BANK_METHODS.map((label) => (
                  <Badge key={label} variant="outline">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">E-Wallet & QRIS</p>
              <div className="flex flex-wrap gap-1.5">
                {EWALLET_METHODS.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 px-4 py-5 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Neo Commerce. Semua hak dilindungi.</p>
          <p>Pembayaran diproses aman oleh Midtrans.</p>
        </div>
      </div>
    </footer>
  );
}
