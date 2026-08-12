import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { ProductSummary } from "../types/product.type";

export async function getAdminProducts(): Promise<ProductSummary[]> {
  return apiFetch<ProductSummary[]>("/api/admin/products");
}

export const getAdminProductsQueryKey = () => ["admin", "products"];

export const getAdminProductsQueryOptions = () =>
  queryOptions({
    queryKey: getAdminProductsQueryKey(),
    queryFn: getAdminProducts,
  });

type UseGetAdminProductsParams = {
  queryConfig?: QueryConfig<typeof getAdminProductsQueryOptions>;
};

export const useGetAdminProducts = (params: UseGetAdminProductsParams = {}) =>
  useQuery({ ...getAdminProductsQueryOptions(), ...params.queryConfig });
