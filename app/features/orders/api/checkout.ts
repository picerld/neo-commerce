import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CheckoutRequest, CheckoutResponse } from "../types/order.type";
import { getOrdersQueryKey } from "./getOrders";
import { getCartQueryKey } from "@/app/features/cart/api/getCart";

export async function checkout(data: CheckoutRequest): Promise<CheckoutResponse> {
  return apiFetch<CheckoutResponse>("/api/orders", { method: "POST", body: JSON.stringify(data) });
}

type UseCheckoutParams = {
  mutationConfig?: MutationConfig<typeof checkout>;
};

export const useCheckout = (params: UseCheckoutParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkout,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getCartQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
