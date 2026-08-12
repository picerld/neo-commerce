import { queryOptions, useQuery } from "@tanstack/react-query";
import { QueryConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { WithdrawalsResponse } from "../types/withdrawal.type";

export async function getWithdrawals(): Promise<WithdrawalsResponse> {
  return apiFetch<WithdrawalsResponse>("/api/admin/withdrawals");
}

export const getWithdrawalsQueryKey = () => ["admin", "withdrawals"];

export const getWithdrawalsQueryOptions = () =>
  queryOptions({
    queryKey: getWithdrawalsQueryKey(),
    queryFn: getWithdrawals,
  });

type UseGetWithdrawalsParams = {
  queryConfig?: QueryConfig<typeof getWithdrawalsQueryOptions>;
};

export const useGetWithdrawals = (params: UseGetWithdrawalsParams = {}) =>
  useQuery({ ...getWithdrawalsQueryOptions(), ...params.queryConfig });
