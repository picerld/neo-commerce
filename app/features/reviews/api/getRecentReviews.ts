import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { RecentReviewSummary } from "../types/review.type";

export async function getRecentReviews(): Promise<RecentReviewSummary[]> {
  return apiFetch<RecentReviewSummary[]>("/api/reviews/recent");
}

export const getRecentReviewsQueryKey = () => ["reviews", "recent"];

export const getRecentReviewsQueryOptions = () =>
  queryOptions({
    queryKey: getRecentReviewsQueryKey(),
    queryFn: getRecentReviews,
  });

type UseGetRecentReviewsParams = {
  queryConfig?: QueryConfig<typeof getRecentReviewsQueryOptions>;
};

export const useGetRecentReviews = (params: UseGetRecentReviewsParams = {}) =>
  useQuery({ ...getRecentReviewsQueryOptions(), ...params.queryConfig });
