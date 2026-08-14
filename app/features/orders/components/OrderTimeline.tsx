import { CheckCircle2, CreditCard, Package, ShoppingBag, Truck, Undo2, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "../types/order.type";

type StepState = "done" | "current" | "upcoming" | "untracked" | "failed";

const HAPPY_STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Dipesan", icon: ShoppingBag },
  { label: "Dibayar", icon: CreditCard },
  { label: "Diproses", icon: Package },
  { label: "Dikirim", icon: Truck },
  { label: "Selesai", icon: CheckCircle2 },
];

const HAPPY_INDEX: Record<string, number> = {
  pending_payment: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  completed: 4,
};

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled" || status === "expired") {
    return (
      <div>
        <Step icon={ShoppingBag} label="Dipesan" state="done" />
        <Step icon={XCircle} label={status === "expired" ? "Kedaluwarsa" : "Dibatalkan"} state="failed" isLast />
      </div>
    );
  }

  if (status === "refunded") {
    // Only `paidAt` is persisted on an order — there's no processingAt/shippedAt
    // timestamp, so once an order is refunded (reachable from paid, processing,
    // shipped, or completed) there's no way to know how far it actually got.
    // Steps 0–1 are the only ones we can honestly claim; the rest render as
    // "not tracked" rather than falsely showing green.
    return (
      <div>
        {HAPPY_STEPS.map((step, i) => (
          <Step key={step.label} icon={step.icon} label={step.label} state={i <= 1 ? "done" : "untracked"} />
        ))}
        <Step icon={Undo2} label="Direfund" state="failed" isLast />
      </div>
    );
  }

  const currentIndex = HAPPY_INDEX[status];
  return (
    <div>
      {HAPPY_STEPS.map((step, i) => (
        <Step
          key={step.label}
          icon={step.icon}
          label={step.label}
          state={i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming"}
          isLast={i === HAPPY_STEPS.length - 1}
        />
      ))}
    </div>
  );
}

function Step({ icon: Icon, label, state, isLast = false }: { icon: LucideIcon; label: string; state: StepState; isLast?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full border-2",
            state === "done" && "border-primary bg-primary text-primary-foreground",
            state === "current" && "border-primary bg-primary/10 text-primary",
            state === "upcoming" && "border-border bg-muted text-muted-foreground",
            state === "untracked" && "border-dashed border-border bg-muted text-muted-foreground",
            state === "failed" && "border-destructive bg-destructive text-destructive-foreground",
          )}
        >
          <Icon className="size-4" />
        </span>
        {!isLast && (
          <span className={cn("min-h-6 w-0.5 flex-1", state === "done" ? "bg-primary" : "border-l-2 border-dashed border-border")} />
        )}
      </div>
      <div className={cn("min-w-0", !isLast && "pb-6")}>
        <p className={cn("text-sm font-bold", (state === "upcoming" || state === "untracked") && "text-muted-foreground")}>{label}</p>
        {state === "untracked" && <p className="text-xs text-muted-foreground">Status tidak tercatat</p>}
        {state === "current" && <p className="text-xs text-primary">Sedang berlangsung</p>}
      </div>
    </div>
  );
}
