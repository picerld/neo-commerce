import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CategorySummary } from "../types/category.type";

export async function getCategories(): Promise<CategorySummary[]> {
  return apiFetch<CategorySummary[]>("/api/categories");
}

export const getCategoriesQueryKey = () => ["categories"];

export const getCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: getCategoriesQueryKey(),
    queryFn: getCategories,
  });

type UseGetCategoriesParams = {
  queryConfig?: QueryConfig<typeof getCategoriesQueryOptions>;
};

export const useGetCategories = (params: UseGetCategoriesParams = {}) =>
  useQuery({ ...getCategoriesQueryOptions(), ...params.queryConfig });
