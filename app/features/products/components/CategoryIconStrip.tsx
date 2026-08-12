"use client";

import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCategories } from "@/app/features/categories/api/getCategories";
import { getCategoryIcon } from "@/app/features/categories/lib/category-icons";

export default function CategoryIconStrip({
  activeSlug,
  onSelect,
}: {
  activeSlug?: string;
  onSelect: (slug: string | undefined) => void;
}) {
  const { data: categories } = useGetCategories();

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      <button type="button" onClick={() => onSelect(undefined)} className="flex shrink-0 flex-col items-center gap-1.5">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full border-2 shadow-[0_2px_0_0_var(--border)] transition-colors",
            activeSlug === undefined ? "border-primary bg-secondary text-secondary-foreground" : "border-border/60 bg-card text-foreground/70 hover:bg-muted",
          )}
        >
          <LayoutGrid className="size-5" />
        </span>
        <span className={cn("text-xs font-semibold", activeSlug === undefined ? "text-primary" : "text-muted-foreground")}>Semua</span>
      </button>

      {categories?.map((category) => {
        const Icon = getCategoryIcon(category.slug);
        const active = activeSlug === category.slug;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.slug)}
            className="flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full border-2 shadow-[0_2px_0_0_var(--border)] transition-colors",
                active ? "border-primary bg-secondary text-secondary-foreground" : "border-border/60 bg-card text-foreground/70 hover:bg-muted",
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className={cn("max-w-16 truncate text-xs font-semibold", active ? "text-primary" : "text-muted-foreground")}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
