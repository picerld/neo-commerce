import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CartResponse } from "../types/cart.type";

export async function getCart(): Promise<CartResponse> {
  return apiFetch<CartResponse>("/api/cart");
}

export const getCartQueryKey = () => ["cart"];

export const getCartQueryOptions = () =>
  queryOptions({
    queryKey: getCartQueryKey(),
    queryFn: getCart,
  });

type UseGetCartParams = {
  queryConfig?: QueryConfig<typeof getCartQueryOptions>;
};

export const useGetCart = (params: UseGetCartParams = {}) =>
  useQuery({ ...getCartQueryOptions(), ...params.queryConfig });
