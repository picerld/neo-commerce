"use client";

import Link from "next/link";
import { ShoppingBag, ShieldCheck, Truck, Wallet, Landmark, CreditCard, Smartphone } from "lucide-react";
import { useGetCategories } from "@/app/features/categories/api/getCategories";
import { useGetMe } from "@/app/features/auth/api/getMe";

const HIGHLIGHTS = [
  { icon: ShieldCheck, text: "Pembayaran aman lewat Midtrans" },
  { icon: Truck, text: "Lacak status pesananmu real-time" },
  { icon: Wallet, text: "Riwayat transaksi transparan" },
];

const PAYMENT_METHODS = [
  { icon: Landmark, label: "Transfer Bank" },
  { icon: CreditCard, label: "Kartu Kredit" },
  { icon: Smartphone, label: "E-Wallet" },
];

export default function StorefrontFooter() {
  const { data: categories } = useGetCategories();
  const { data: me } = useGetMe();

  return (
    <footer className="border-t-2 border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-3 rounded-2xl border-2 border-border/60 bg-background p-5 shadow-[0_3px_0_0_var(--border)] sm:grid-cols-3">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
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
            <Link href="/" className="flex items-center gap-1.5 font-heading font-extrabold text-foreground">
              <ShoppingBag className="size-4 text-primary" /> Neo Commerce
            </Link>
            <p className="text-xs text-muted-foreground">
              Belanja kebutuhanmu dengan mudah, bayar aman lewat Midtrans, dan pantau pesanan sampai tujuan.
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

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pembayaran</p>
            <ul className="space-y-1.5 text-sm">
              {PAYMENT_METHODS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-1.5 text-foreground/80">
                  <Icon className="size-3.5 text-muted-foreground" /> {label}
                </li>
              ))}
            </ul>
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
