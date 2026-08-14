import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    illustration: "/illustrations/online-shopping.svg",
    title: "Pilih & Checkout",
    description: "Jelajahi katalog dan checkout dalam hitungan detik.",
  },
  {
    illustration: "/illustrations/secure-login.svg",
    title: "Bayar Aman",
    description: "Kartu, VA bank, atau e-wallet lewat Midtrans — semua terenkripsi.",
  },
  {
    illustration: "/illustrations/delivery.svg",
    title: "Lacak & Terima",
    description: "Pantau pengiriman real-time sampai paket tiba.",
  },
];

// Numbered, connected steps living inside the hero itself (rather than a
// separate section further down the page) so the "why shop here" pitch is
// part of the first impression, not something a visitor has to scroll to.
export default function HeroStepper() {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-border/60 bg-card p-5 shadow-[0_4px_0_0_var(--border)] sm:p-6">
      <p className="mb-4 font-heading text-sm font-extrabold tracking-tight">Kenapa Belanja di Sini?</p>
      <div>
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex min-w-0 gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-[11px] font-extrabold text-primary-foreground">
                {i + 1}
              </span>
              {i < STEPS.length - 1 && <span className="w-0.5 flex-1 border-l-2 border-dashed border-primary/25" />}
            </div>
            <div
              className={cn(
                "flex min-w-0 flex-1 items-center gap-3 rounded-2xl border-2 border-border/60 bg-background p-2.5",
                i < STEPS.length - 1 && "mb-3",
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Image src={step.illustration} alt="" aria-hidden width={36} height={36} unoptimized className="size-8" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{step.title}</p>
                <p className="truncate text-xs text-muted-foreground">{step.description}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
