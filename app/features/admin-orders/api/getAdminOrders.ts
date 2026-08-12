import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { OrderStatus, OrderSummary } from "@/app/features/orders/types/order.type";

export async function getAdminOrders(status?: OrderStatus): Promise<OrderSummary[]> {
  const qs = status ? `?status=${status}` : "";
  return apiFetch<OrderSummary[]>(`/api/admin/orders${qs}`);
}

export const getAdminOrdersQueryKey = (status?: OrderStatus) => ["admin", "orders", status ?? "all"];

export const getAdminOrdersQueryOptions = (status?: OrderStatus) =>
  queryOptions({
    queryKey: getAdminOrdersQueryKey(status),
    queryFn: () => getAdminOrders(status),
  });

type UseGetAdminOrdersParams = {
  status?: OrderStatus;
  queryConfig?: QueryConfig<typeof getAdminOrdersQueryOptions>;
};

export const useGetAdminOrders = ({ status, queryConfig }: UseGetAdminOrdersParams = {}) =>
  useQuery({ ...getAdminOrdersQueryOptions(status), ...queryConfig });
