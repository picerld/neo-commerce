"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCategories } from "@/app/features/categories/api/getCategories";
import { getCategoryIcon } from "@/app/features/categories/lib/category-icons";

export default function CategoryIconStrip() {
  const router = useRouter();
  const { data: categories } = useGetCategories();

  return (
    <div className="rounded-2xl border-2 border-border/60 bg-card p-4 shadow-[0_3px_0_0_var(--border)] sm:p-5">
      <h2 className="mb-3 font-heading text-sm font-extrabold tracking-tight">Kategori Pilihan</h2>
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        <button type="button" onClick={() => router.push("/search")} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <span className="flex size-14 items-center justify-center rounded-full border-2 border-border/60 bg-background text-foreground/70 shadow-[0_2px_0_0_var(--border)] transition-colors hover:border-primary hover:bg-secondary hover:text-secondary-foreground">
            <LayoutGrid className="size-5" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Semua</span>
        </button>

        {categories?.map((category) => {
          const Icon = getCategoryIcon(category.slug);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => router.push(`/search?category=${category.slug}`)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-full border-2 border-border/60 bg-background text-foreground/70 shadow-[0_2px_0_0_var(--border)] transition-colors",
                  "hover:border-primary hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="max-w-16 truncate text-xs font-semibold text-muted-foreground">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
