"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageOff, MessagesSquare, User as UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/shared/ErrorState";
import { useGetRecentReviews } from "../api/getRecentReviews";
import { StarRow } from "./ReviewsSection";

export default function RecentReviewsSection() {
  const { data: reviews, isLoading, isError, refetch } = useGetRecentReviews();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-72 shrink-0" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState title="Gagal memuat ulasan" onRetry={() => refetch()} />;
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-1.5 font-heading text-lg font-extrabold tracking-tight">
        <MessagesSquare className="size-5 text-primary" /> Ulasan Terbaru dari Pembeli
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {reviews.map((review) => (
          <Link
            key={review.id}
            href={`/products/${review.productSlug}`}
            className="w-72 shrink-0 space-y-2.5 rounded-2xl border-2 border-border/60 bg-card p-4 shadow-[0_3px_0_0_var(--border)] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                {review.productImageUrl ? (
                  <Image src={review.productImageUrl} alt={review.productName} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="size-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="line-clamp-1 min-w-0 flex-1 text-xs font-bold text-foreground/80">{review.productName}</p>
            </div>

            <StarRow rating={review.rating} size="size-3.5" />
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{review.comment}</p>

            <div className="flex items-center gap-1.5 border-t border-border/60 pt-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <UserIcon className="size-3" />
              </span>
              <span className="truncate text-[11px] font-semibold text-muted-foreground">{review.reviewerName}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
