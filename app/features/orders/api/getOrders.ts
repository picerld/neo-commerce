import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { OrderSummary } from "../types/order.type";

export async function getOrders(): Promise<OrderSummary[]> {
  return apiFetch<OrderSummary[]>("/api/orders");
}

export const getOrdersQueryKey = () => ["orders"];

export const getOrdersQueryOptions = () =>
  queryOptions({
    queryKey: getOrdersQueryKey(),
    queryFn: getOrders,
  });

type UseGetOrdersParams = {
  queryConfig?: QueryConfig<typeof getOrdersQueryOptions>;
};

export const useGetOrders = (params: UseGetOrdersParams = {}) =>
  useQuery({ ...getOrdersQueryOptions(), ...params.queryConfig });
