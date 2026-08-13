"use client";

import * as React from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { MessageSquareText, Star, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/shared/ErrorState";
import { Field, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useGetReviews } from "../api/getReviews";
import { useCreateReview } from "../api/createReview";
import { createReviewFormSchema } from "../forms/review";

export function StarRow({ rating, size = "size-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5 text-warning">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size, i <= Math.round(rating) ? "fill-warning" : "fill-none text-border")} />
      ))}
    </div>
  );
}

export default function ReviewsSection({ slug }: { slug: string }) {
  const { data: me } = useGetMe();
  const { data, isLoading, isError, refetch } = useGetReviews(slug);

  if (isError) {
    return <ErrorState title="Gagal memuat ulasan" onRetry={() => refetch()} />;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  const { reviews, avgRating, reviewCount, histogram, viewerHasReviewed } = data;

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <CardContent className="grid gap-6 px-0 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center gap-1 sm:border-r sm:border-border/60 sm:pr-6">
            <p className="font-heading text-4xl font-extrabold tracking-tight">{reviewCount > 0 ? avgRating.toFixed(1) : "—"}</p>
            <StarRow rating={avgRating} />
            <p className="text-xs text-muted-foreground">{reviewCount} ulasan</p>
          </div>
          <div className="space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = histogram[String(star) as keyof typeof histogram];
              const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 shrink-0 font-semibold text-muted-foreground">{star}</span>
                  <Star className="size-3 shrink-0 fill-warning text-warning" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {me && !viewerHasReviewed && <WriteReviewForm slug={slug} />}

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada ulasan untuk produk ini.</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <CardContent className="space-y-1.5 px-0">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-secondary-foreground">
                    <UserIcon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{review.reviewerName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <StarRow rating={review.rating} size="size-3.5" />
                {review.comment && <p className="text-sm leading-relaxed text-foreground/80">{review.comment}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function WriteReviewForm({ slug }: { slug: string }) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const createReviewMutation = useCreateReview({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Terima kasih atas ulasanmu!");
        form.reset();
      },
      onError: (error) => toast.error(error.message || "Gagal mengirim ulasan"),
    },
  });

  const form = useForm({
    defaultValues: { rating: 0, comment: "" },
    validators: { onSubmit: createReviewFormSchema },
    onSubmit: async ({ value }) => createReviewMutation.mutate({ slug, ...value }),
  });

  return (
    <Card className="p-5 sm:p-6">
      <CardContent className="space-y-4 px-0">
        <p className="flex items-center gap-1.5 font-heading text-sm font-extrabold tracking-tight">
          <MessageSquareText className="size-4 text-primary" /> Tulis Ulasan
        </p>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <form.Field name="rating">
            {(field) => {
              const errors = field.state.meta.errors;
              const isInvalid = field.state.meta.isTouched && errors.length > 0;
              return (
                <Field data-invalid={isInvalid}>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHoverRating(i)}
                        onClick={() => field.handleChange(i)}
                        aria-label={`${i} bintang`}
                        className="p-0.5"
                      >
                        <Star
                          className={cn(
                            "size-7 transition-colors",
                            i <= (hoverRating || field.state.value) ? "fill-warning text-warning" : "fill-none text-border",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field name="comment">
            {(field) => {
              const errors = field.state.meta.errors;
              const isInvalid = field.state.meta.isTouched && errors.length > 0;
              return (
                <Field data-invalid={isInvalid}>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ceritakan pengalamanmu dengan produk ini (opsional)"
                    disabled={createReviewMutation.isPending}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              );
            }}
          </form.Field>

          <Button type="submit" size="sm" disabled={createReviewMutation.isPending}>
            {createReviewMutation.isPending ? "Mengirim..." : "Kirim Ulasan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
