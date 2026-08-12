import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { OrderDetail } from "../types/order.type";
import { getOrdersQueryKey } from "./getOrders";
import { getOrderQueryKey } from "./getOrder";

export async function cancelOrder(id: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/api/orders/${id}/cancel`, { method: "POST" });
}

type UseCancelOrderParams = {
  mutationConfig?: MutationConfig<typeof cancelOrder>;
};

export const useCancelOrder = (params: UseCancelOrderParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getOrderQueryKey(variables) });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
