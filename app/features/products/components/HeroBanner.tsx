import { Sparkles, ShieldCheck, Truck } from "lucide-react";

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-border/60 bg-primary p-6 text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklab,var(--primary),black_18%)] sm:p-10">
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
  );
}
