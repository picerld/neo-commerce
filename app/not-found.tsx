import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" />
      </span>
      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Halaman tidak ditemukan</h1>
        <p className="text-sm text-muted-foreground">Sepertinya kamu tersesat. Yuk kembali ke halaman utama.</p>
      </div>
      <Button asChild>
        <Link href="/">
          <Home className="size-4" /> Kembali ke Beranda
        </Link>
      </Button>
    </main>
  );
}
