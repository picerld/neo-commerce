import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { OrderDetail } from "../types/order.type";

export async function getOrder(id: string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(`/api/orders/${id}`);
}

export const getOrderQueryKey = (id: string) => ["orders", "detail", id];

export const getOrderQueryOptions = (id: string) =>
  queryOptions({
    queryKey: getOrderQueryKey(id),
    queryFn: () => getOrder(id),
  });

type UseGetOrderParams = {
  queryConfig?: QueryConfig<typeof getOrderQueryOptions>;
};

export const useGetOrder = (id: string, params: UseGetOrderParams = {}) =>
  useQuery({ ...getOrderQueryOptions(id), ...params.queryConfig });
