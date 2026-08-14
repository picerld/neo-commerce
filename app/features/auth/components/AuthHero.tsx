import { ShieldCheck, Truck, Wallet } from "lucide-react";
import Logo from "@/components/shared/Logo";

const FEATURES = [
  { icon: ShieldCheck, text: "Pembayaran aman lewat Midtrans" },
  { icon: Truck, text: "Lacak status pesananmu real-time" },
  { icon: Wallet, text: "Riwayat transaksi transparan" },
];

export default function AuthHero() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary),#7c3aed_35%)] p-10 text-primary-foreground md:flex">
      <div aria-hidden className="bg-dot-grid pointer-events-none absolute inset-0 text-white/10" />

      <div className="relative z-10">
        <Logo size="lg" />
      </div>

      <div className="relative z-10 space-y-6">
        <h2 className="font-heading text-3xl font-extrabold leading-tight text-balance">
          Belanja gampang, bayar aman, pantau semua di satu tempat.
        </h2>
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm font-medium text-primary-foreground/90">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon className="size-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-primary-foreground/70">© {new Date().getFullYear()} Neo Commerce</p>
    </div>
  );
}
