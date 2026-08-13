"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, Truck, ImageOff } from "lucide-react";
import { useGetProducts } from "../api/getProducts";

export default function HeroBanner() {
  const { data: products } = useGetProducts();
  const collage = (products ?? []).filter((p) => p.imageUrl).slice(0, 4);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-2xl border-2 border-border/60 bg-primary p-6 text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklab,var(--primary),black_18%)] sm:p-10 md:col-span-2">
        <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 text-white/10" />
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="size-3.5" /> Promo Hari Ini
          </span>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
            Belanja kebutuhanmu, bayar aman, sampai tepat waktu.
          </h1>
          <div className="flex flex-wrap gap-4 pt-2 text-sm font-semibold text-primary-foreground/90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Pembayaran via Midtrans
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4" /> Gratis lacak pesanan
            </span>
          </div>
        </div>
      </div>

      {/* Product-photo collage — real catalog imagery instead of a second
          flat color block, so the hero doesn't read as pure solid blue. */}
      <div className="grid grid-cols-2 grid-rows-2 gap-3">
        {collage.length > 0
          ? collage.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-muted shadow-[0_3px_0_0_var(--border)]"
              >
                <Image
                  src={product.imageUrl!}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="line-clamp-1 text-[11px] font-semibold text-white">{product.name}</p>
                </div>
              </Link>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center rounded-2xl border-2 border-border/60 bg-muted text-muted-foreground shadow-[0_3px_0_0_var(--border)]">
                <ImageOff className="size-5" />
              </div>
            ))}
      </div>
    </div>
  );
}
