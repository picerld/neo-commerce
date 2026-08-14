import { ShieldCheck, Sparkles, Truck, Wallet } from "lucide-react";
import Logo from "@/components/shared/Logo";

const FEATURES = [
  { icon: ShieldCheck, text: "Pembayaran aman lewat Midtrans" },
  { icon: Truck, text: "Lacak status pesananmu real-time" },
  { icon: Wallet, text: "Riwayat transaksi transparan" },
];

// Same "white surface, blue accent" language as the storefront's hero
// banner (soft token-based blobs, dot-grid texture, blue-tinted chips)
// instead of a flat gradient fill, so first impression and homepage read
// as one consistent design system.
export default function AuthHero() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden border-r-2 border-primary/20 bg-card p-10 text-foreground md:flex">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-10 size-64 rounded-full bg-chart-4/10 blur-3xl" />
      <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 text-primary/8" />

      <div className="relative z-10">
        <Logo size="lg" />
      </div>

      <div className="relative z-10 space-y-6">
        <span className="animate-pop-in inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
          <Sparkles className="size-3.5" /> Belanja Terpercaya
        </span>
        <h2 className="font-heading text-3xl font-extrabold leading-tight text-balance">
          Belanja gampang, bayar aman,{" "}
          <span className="relative inline-block">
            pantau semua di satu tempat
            <span aria-hidden className="absolute inset-x-0 -bottom-0.5 -z-10 h-3 -rotate-1 bg-primary/25" />
          </span>
          .
        </h2>
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-primary/25 bg-primary/10">
                <Icon className="size-4 text-primary" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-muted-foreground">© {new Date().getFullYear()} Neo Commerce</p>
    </div>
  );
}
