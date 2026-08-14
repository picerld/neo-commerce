"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, ShieldCheck, Truck, ImageOff } from "lucide-react";
import { useGetProducts } from "../api/getProducts";

export default function HeroBanner() {
  const { data: products } = useGetProducts();
  const collage = (products ?? []).filter((p) => p.imageUrl).slice(0, 4);

  return (
    <div className="grid animate-fade-in-up gap-3 md:grid-cols-3">
      <div className="relative overflow-hidden rounded-3xl border-2 border-border/60 bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary),#7c3aed_35%)] p-6 text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklab,var(--primary),black_18%)] sm:p-10 md:col-span-2">
        {/* Layered accent decoration — soft color blobs + dot-grid texture
            behind the copy, so the banner reads as designed rather than a
            flat color fill. Blobs sit outside the content's max-w column,
            clipped by overflow-hidden on the panel. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full bg-[#7c3aed]/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-16 size-56 rounded-full bg-[#ec4899]/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -right-24 size-72 -translate-y-1/2 rounded-full bg-[#06b6d4]/20 blur-3xl"
        />
        <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 text-white/10" />
        <div className="relative z-10 max-w-lg space-y-4">
          <span className="animate-pop-in inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
            <Sparkles className="size-3.5" /> Promo Hari Ini
          </span>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
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
                className="press-shadow group relative overflow-hidden rounded-2xl border-2 border-border/60 bg-muted shadow-[0_3px_0_0_var(--border)]"
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
