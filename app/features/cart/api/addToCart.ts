import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { AddToCartRequest, CartResponse } from "../types/cart.type";
import { getCartQueryKey } from "./getCart";

export async function addToCart(data: AddToCartRequest): Promise<CartResponse> {
  return apiFetch<CartResponse>("/api/cart", { method: "POST", body: JSON.stringify(data) });
}

type UseAddToCartParams = {
  mutationConfig?: MutationConfig<typeof addToCart>;
};

export const useAddToCart = (params: UseAddToCartParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToCart,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
