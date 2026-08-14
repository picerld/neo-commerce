"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Clock, TrendingUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const RECENT_KEY = "neo-recent-searches";
const MAX_RECENT = 5;

// Static curated list (not derived from real analytics) — phrased as search
// queries rather than category names, matching the catalog's actual product
// names so it reads as plausible rather than generic placeholder text.
const TRENDING_SEARCHES = ["sepatu sneakers", "smartwatch", "tas ransel laptop", "skincare", "vitamin harian", "jam tangan kulit"];

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable (private mode / quota) — recent history is best-effort only.
  }
}

export default function HeaderSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSearchPage = pathname === "/search";

  // Keeps the search box in sync with the URL (e.g. after a nav or back/
  // forward) without an effect — React's recommended pattern for adjusting
  // state during render in response to a prop/derived-value change.
  const searchFromUrl = isSearchPage ? (searchParams.get("q") ?? "") : "";
  const [search, setSearch] = React.useState(searchFromUrl);
  const [syncedSearch, setSyncedSearch] = React.useState(searchFromUrl);
  if (searchFromUrl !== syncedSearch) {
    setSyncedSearch(searchFromUrl);
    setSearch(searchFromUrl);
  }

  const [open, setOpen] = React.useState(false);
  // Lazy initializer only runs client-side after hydration touches this
  // value (the dropdown is closed on first render, so `recent` never
  // affects the SSR'd markup — safe to read localStorage here without a
  // hydration mismatch, and without a setState-in-effect roundtrip).
  const [recent, setRecent] = React.useState<string[]>(() => readRecent());

  const runSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      setRecent((prev) => {
        const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
        writeRecent(next);
        return next;
      });
    }
    setSearch(trimmed);
    setOpen(false);
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  const removeRecent = (term: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setRecent((prev) => {
      const next = prev.filter((item) => item !== term);
      writeRecent(next);
      return next;
    });
  };

  const clearAllRecent = () => {
    setRecent([]);
    writeRecent([]);
  };

  const showSuggestions = open && (recent.length > 0 || TRENDING_SEARCHES.length > 0);

  return (
    <div
      className="relative min-w-0 flex-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(search);
        }}
      >
        <div className="flex h-10 items-stretch overflow-hidden rounded-lg border-2 border-transparent bg-white shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary),black_30%)] transition-colors focus-within:border-white">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Cari di Neo Commerce"
            className="h-full flex-1 rounded-none border-transparent bg-transparent text-foreground shadow-none focus-visible:border-transparent focus-visible:ring-0"
          />
          <button
            type="submit"
            aria-label="Cari"
            className="flex w-12 shrink-0 items-center justify-center bg-[color-mix(in_oklab,var(--primary),black_12%)] text-primary-foreground transition-colors hover:brightness-110"
          >
            <Search className="size-4" />
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div className="animate-fade-in-up absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border-2 border-border/60 bg-card p-3 text-foreground shadow-[0_4px_0_0_var(--border)]">
          {recent.length > 0 && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between px-1">
                <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Pencarian Terakhir</p>
                <button type="button" onClick={clearAllRecent} className="text-[11px] font-semibold text-primary hover:underline">
                  Hapus semua
                </button>
              </div>
              <ul>
                {recent.map((term) => (
                  <li key={term} className="group flex items-center rounded-lg hover:bg-muted">
                    <button
                      type="button"
                      onClick={() => runSearch(term)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 text-left text-sm"
                    >
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{term}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => removeRecent(term, event)}
                      aria-label={`Hapus "${term}" dari riwayat`}
                      className="mr-1 shrink-0 rounded-full p-1 text-muted-foreground opacity-100 hover:bg-border/60 hover:text-foreground focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1 px-1 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">Pencarian Trending</p>
            <ul>
              {TRENDING_SEARCHES.map((term) => (
                <li key={term}>
                  <button
                    type="button"
                    onClick={() => runSearch(term)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <TrendingUp className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{term}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
