import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { OrderDetail } from "../types/order.type";
import { getOrdersQueryKey } from "./getOrders";
import { getOrderQueryKey } from "./getOrder";

export async function syncPayment(id: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/api/orders/${id}/sync-payment`, { method: "POST" });
}

type UseSyncPaymentParams = {
  mutationConfig?: MutationConfig<typeof syncPayment>;
};

export const useSyncPayment = (params: UseSyncPaymentParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncPayment,
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
