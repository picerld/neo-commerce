import { cn } from "@/lib/utils";

// Custom geometric "N" monogram — two rounded bars with a connecting
// diagonal stroke — instead of a generic shopping-bag icon from the
// library, so the brand mark is distinct from every other lucide-icon
// storefront.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="3.4" height="16" rx="1.7" fill="currentColor" />
      <rect x="16.6" y="4" width="3.4" height="16" rx="1.7" fill="currentColor" />
      <path d="M6 5.5 18.5 18.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

const BOX_SIZE = { sm: "size-8", md: "size-9", lg: "size-10" } as const;
const ICON_SIZE = { sm: "size-4", md: "size-4.5", lg: "size-5" } as const;
const TEXT_SIZE = { sm: "text-sm", md: "text-base", lg: "text-lg" } as const;

export default function Logo({
  size = "md",
  showWordmark = true,
  wordmarkClassName,
  className,
}: {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  /** Extra classes on the wordmark span — e.g. "hidden sm:inline" to collapse it on narrow headers. */
  wordmarkClassName?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {/* Fixed white tile + black mark — a flat brand color that stays
          legible and consistent on any background (blue header, gradient
          hero, light footer) rather than needing a per-context tone. */}
      <span
        className={cn(
          BOX_SIZE[size],
          "flex shrink-0 items-center justify-center rounded-xl border-2 border-black/10 bg-white text-black shadow-[0_2px_0_0_rgba(0,0,0,0.18)]",
        )}
      >
        <LogoMark className={ICON_SIZE[size]} />
      </span>
      {showWordmark && (
        <span className={cn("font-heading font-extrabold tracking-tight", TEXT_SIZE[size], wordmarkClassName)}>
          Neo Commerce
        </span>
      )}
    </span>
  );
}
