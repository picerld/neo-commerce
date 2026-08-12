import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { ProductSummary } from "../types/product.type";

export async function getProduct(slug: string): Promise<ProductSummary> {
  return apiFetch<ProductSummary>(`/api/products/${slug}`);
}

export const getProductQueryKey = (slug: string) => ["products", "detail", slug];

export const getProductQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: getProductQueryKey(slug),
    queryFn: () => getProduct(slug),
  });

type UseGetProductParams = {
  queryConfig?: QueryConfig<typeof getProductQueryOptions>;
};

export const useGetProduct = (slug: string, params: UseGetProductParams = {}) =>
  useQuery({ ...getProductQueryOptions(slug), ...params.queryConfig });
