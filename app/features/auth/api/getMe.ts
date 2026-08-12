import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { MeResponse } from "../types/auth.type";

export async function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>("/api/auth/me");
}

export const getMeQueryKey = () => ["auth", "me"];

export const getMeQueryOptions = () =>
  queryOptions({
    queryKey: getMeQueryKey(),
    queryFn: getMe,
  });

type UseGetMeParams = {
  queryConfig?: QueryConfig<typeof getMeQueryOptions>;
};

export const useGetMe = (params: UseGetMeParams = {}) =>
  useQuery({ ...getMeQueryOptions(), ...params.queryConfig });
