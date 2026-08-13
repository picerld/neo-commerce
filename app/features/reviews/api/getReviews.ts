import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { ReviewListResponse } from "../types/review.type";

export async function getReviews(slug: string): Promise<ReviewListResponse> {
  return apiFetch<ReviewListResponse>(`/api/products/${slug}/reviews`);
}

export const getReviewsQueryKey = (slug: string) => ["products", slug, "reviews"];

export const getReviewsQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: getReviewsQueryKey(slug),
    queryFn: () => getReviews(slug),
  });

type UseGetReviewsParams = {
  queryConfig?: QueryConfig<typeof getReviewsQueryOptions>;
};

export const useGetReviews = (slug: string, params: UseGetReviewsParams = {}) =>
  useQuery({ ...getReviewsQueryOptions(slug), ...params.queryConfig, enabled: !!slug && (params.queryConfig?.enabled ?? true) });
