import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { OrderDetail, UpdateOrderStatusRequest } from "@/app/features/orders/types/order.type";
import { getOrderQueryKey } from "@/app/features/orders/api/getOrder";
import { getAdminOrdersQueryKey } from "./getAdminOrders";

export async function updateOrderStatus({ id, ...data }: UpdateOrderStatusRequest & { id: string }): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/api/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(data) });
}

type UseUpdateOrderStatusParams = {
  mutationConfig?: MutationConfig<typeof updateOrderStatus>;
};

export const useUpdateOrderStatus = (params: UseUpdateOrderStatusParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getAdminOrdersQueryKey() });
      queryClient.invalidateQueries({ queryKey: getOrderQueryKey(variables.id) });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
