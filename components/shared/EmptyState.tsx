import Image from "next/image";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  /** Path to an SVG under /public/illustrations — takes priority over `icon` when given. */
  illustration?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      {illustration ? (
        <Image src={illustration} alt="" aria-hidden width={160} height={124} unoptimized className="h-auto w-40" />
      ) : (
        Icon && (
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </span>
        )
      )}
      <div className="space-y-1">
        <p className="text-sm font-bold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
