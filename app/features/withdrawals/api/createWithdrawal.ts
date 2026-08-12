import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CreateWithdrawalRequest, WithdrawalRecordSummary } from "../types/withdrawal.type";
import { getWithdrawalsQueryKey } from "./getWithdrawals";
import { getDashboardQueryKey } from "@/app/features/admin-dashboard/api/getDashboard";

export async function createWithdrawal(data: CreateWithdrawalRequest): Promise<WithdrawalRecordSummary> {
  return apiFetch<WithdrawalRecordSummary>("/api/admin/withdrawals", { method: "POST", body: JSON.stringify(data) });
}

type UseCreateWithdrawalParams = {
  mutationConfig?: MutationConfig<typeof createWithdrawal>;
};

export const useCreateWithdrawal = (params: UseCreateWithdrawalParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWithdrawal,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getWithdrawalsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getDashboardQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
