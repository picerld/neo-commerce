import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CartResponse } from "../types/cart.type";
import { getCartQueryKey } from "./getCart";

export async function removeCartItem(itemId: string): Promise<CartResponse> {
  return apiFetch<CartResponse>(`/api/cart/${itemId}`, { method: "DELETE" });
}

type UseRemoveCartItemParams = {
  mutationConfig?: MutationConfig<typeof removeCartItem>;
};

export const useRemoveCartItem = (params: UseRemoveCartItemParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
