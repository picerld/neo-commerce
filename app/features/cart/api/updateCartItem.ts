import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CartResponse, UpdateCartItemRequest } from "../types/cart.type";
import { getCartQueryKey } from "./getCart";

export async function updateCartItem({ itemId, ...data }: UpdateCartItemRequest & { itemId: string }): Promise<CartResponse> {
  return apiFetch<CartResponse>(`/api/cart/${itemId}`, { method: "PATCH", body: JSON.stringify(data) });
}

type UseUpdateCartItemParams = {
  mutationConfig?: MutationConfig<typeof updateCartItem>;
};

export const useUpdateCartItem = (params: UseUpdateCartItemParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
