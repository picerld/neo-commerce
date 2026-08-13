import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({
  title = "Gagal memuat data",
  description = "Terjadi kendala saat mengambil data. Coba lagi dalam beberapa saat.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          <RotateCw className="size-3.5" /> Coba Lagi
        </Button>
      )}
    </div>
  );
}
