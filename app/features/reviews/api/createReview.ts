import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CreateReviewRequest } from "../types/review.type";
import { getReviewsQueryKey } from "./getReviews";
import { getProductQueryKey } from "@/app/features/products/api/getProduct";

export async function createReview({ slug, ...data }: CreateReviewRequest & { slug: string }): Promise<null> {
  return apiFetch<null>(`/api/products/${slug}/reviews`, { method: "POST", body: JSON.stringify(data) });
}

type UseCreateReviewParams = {
  mutationConfig?: MutationConfig<typeof createReview>;
};

export const useCreateReview = (params: UseCreateReviewParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getReviewsQueryKey(variables.slug) });
      queryClient.invalidateQueries({ queryKey: getProductQueryKey(variables.slug) });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
