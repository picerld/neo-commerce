export type ReviewSummary = {
  id: string;
  rating: number;
  comment: string | null;
  reviewerName: string;
  createdAt: string;
};

export type ReviewListResponse = {
  reviews: ReviewSummary[];
  avgRating: number;
  reviewCount: number;
  histogram: Record<"1" | "2" | "3" | "4" | "5", number>;
  viewerHasReviewed: boolean;
};

export type CreateReviewRequest = {
  rating: number;
  comment?: string;
};

export type RecentReviewSummary = ReviewSummary & {
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
};
