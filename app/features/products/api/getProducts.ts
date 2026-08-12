import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { ProductListParams, ProductSummary } from "../types/product.type";

export async function getProducts(params: ProductListParams = {}): Promise<ProductSummary[]> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.categorySlug) query.set("category", params.categorySlug);
  const qs = query.toString();
  return apiFetch<ProductSummary[]>(`/api/products${qs ? `?${qs}` : ""}`);
}

export const getProductsQueryKey = (params: ProductListParams = {}) => ["products", params];

export const getProductsQueryOptions = (params: ProductListParams = {}) =>
  queryOptions({
    queryKey: getProductsQueryKey(params),
    queryFn: () => getProducts(params),
  });

type UseGetProductsParams = {
  params?: ProductListParams;
  queryConfig?: QueryConfig<typeof getProductsQueryOptions>;
};

export const useGetProducts = ({ params = {}, queryConfig }: UseGetProductsParams = {}) =>
  useQuery({ ...getProductsQueryOptions(params), ...queryConfig });
