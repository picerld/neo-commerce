import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { DashboardResponse } from "../types/dashboard.type";

export async function getDashboard(): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/api/admin/dashboard");
}

export const getDashboardQueryKey = () => ["admin", "dashboard"];

export const getDashboardQueryOptions = () =>
  queryOptions({
    queryKey: getDashboardQueryKey(),
    queryFn: getDashboard,
  });

type UseGetDashboardParams = {
  queryConfig?: QueryConfig<typeof getDashboardQueryOptions>;
};

export const useGetDashboard = (params: UseGetDashboardParams = {}) =>
  useQuery({ ...getDashboardQueryOptions(), ...params.queryConfig });
