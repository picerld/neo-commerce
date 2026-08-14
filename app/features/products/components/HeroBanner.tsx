"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Truck, ShoppingBag, Flame } from "lucide-react";
import HeroStepper from "./HeroStepper";

export default function HeroBanner() {
  return (
    <div className="animate-fade-in-up space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:items-stretch">
        <div className="relative min-w-0 md:col-span-2">
          <div className="relative flex h-full flex-col justify-center overflow-hidden rounded-3xl border-2 border-primary/30 bg-card p-6 text-foreground shadow-[0_4px_0_0_var(--primary)] sm:p-10">
            {/* Layered accent decoration — soft color blobs + dot-grid texture,
                all drawn from theme tokens (not one-off hex) so the panel
                stays a white surface with blue as an accent rather than a
                flat color fill. Blobs sit outside the content's max-w column,
                clipped by overflow-hidden on the panel. */}
            <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 text-primary/8" />

            {/* Floating mascot chip — a little bounce of personality tucked
                into the corner so the panel doesn't just read as a flat
                marketing slab. */}
            <div
              aria-hidden
              className="animate-float pointer-events-none absolute top-6 right-6 hidden size-14 items-center justify-center rounded-2xl border-2 border-primary/25 bg-primary/10 sm:flex"
            >
              <ShoppingBag className="size-6 -rotate-6 text-primary" />
            </div>

            <div className="relative z-10 max-w-lg space-y-4">
              <span className="animate-pop-in inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                <Sparkles className="size-3.5" /> Promo Hari Ini
              </span>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
                Belanja kebutuhanmu, bayar aman,{" "}
                <span className="relative inline-block whitespace-nowrap">
                  sampai tepat waktu
                  <span aria-hidden className="absolute inset-x-0 -bottom-0.5 -z-10 h-3 -rotate-1 bg-primary/25 sm:h-3.5" />
                </span>
                .
              </h1>
              <div className="flex flex-wrap gap-4 pt-2 text-sm font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" /> Pembayaran via Midtrans
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="size-4 text-primary" /> Gratis lacak pesanan
                </span>
              </div>
            </div>
          </div>

          {/* Sticker badge overlapping the panel's edge — lives on this
              overflow-visible wrapper (not the panel itself, which needs
              overflow-hidden to clip its blur blobs) so it can poke past the
              border like a physical sticker. */}
          <div
            className="animate-float absolute -top-3 -left-3 z-20 flex -rotate-6 items-center gap-1 rounded-xl border-2 border-primary/40 bg-card px-2.5 py-1.5 text-xs font-extrabold text-foreground shadow-[0_3px_0_0_var(--primary)] sm:-top-4 sm:-left-4 sm:px-3 sm:py-2 sm:text-sm"
          >
            <Flame className="size-3.5 text-primary sm:size-4" /> Diskon s/d 40%
          </div>
        </div>

        {/* Numbered "why shop here" steps — lives in the hero itself instead
            of a separate section further down, so trust-building is part of
            the first impression rather than something a visitor has to
            scroll to find. */}
        <div className="min-w-0 md:col-span-3">
          <HeroStepper />
        </div>
      </div>

      <FlashSaleTicker />
    </div>
  );
}

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, midnight.getTime() - now.getTime());
}

/** Starts at null so the server-rendered markup and the first client render
 * match exactly — the real countdown only kicks in after mount, avoiding a
 * hydration mismatch from a clock value computed twice a moment apart. */
function useMidnightCountdown() {
  const [remainingMs, setRemainingMs] = React.useState<number | null>(null);

  React.useEffect(() => {
    const id = setInterval(() => setRemainingMs(getMsUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return remainingMs;
}

function TimeBox({ value }: { value: number }) {
  return (
    <span className="flex size-7 items-center justify-center rounded-md border-2 border-border bg-foreground font-mono text-xs font-extrabold text-background sm:size-8 sm:text-sm">
      {String(value).padStart(2, "0")}
    </span>
  );
}

function FlashSaleTicker() {
  const remainingMs = useMidnightCountdown();
  const totalSeconds = Math.floor((remainingMs ?? 0) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="press-shadow flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary/30 bg-card px-4 py-3 shadow-[0_3px_0_0_var(--primary)] sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Flame className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="font-heading text-sm font-extrabold tracking-tight text-foreground sm:text-base">Flash Sale Hari Ini</p>
          <p className="truncate text-xs text-muted-foreground">Diskon terbaik berakhir tengah malam</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5" aria-label="Sisa waktu flash sale">
        <TimeBox value={hours} />
        <span className="font-extrabold text-primary">:</span>
        <TimeBox value={minutes} />
        <span className="font-extrabold text-primary">:</span>
        <TimeBox value={seconds} />
      </div>
      <Link
        href="/search?sort=terlaris"
        className="press-shadow shrink-0 rounded-full border-2 border-primary bg-primary px-4 py-1.5 text-xs font-bold whitespace-nowrap text-primary-foreground hover:bg-primary/90"
      >
        Serbu Sekarang
      </Link>
    </div>
  );
}
