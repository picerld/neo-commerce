import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { RegisterRequest, UserSummary } from "../types/auth.type";

export async function register(data: RegisterRequest): Promise<UserSummary> {
  return apiFetch<UserSummary>("/api/auth/register", { method: "POST", body: JSON.stringify(data) });
}

type UseRegisterParams = {
  mutationConfig?: MutationConfig<typeof register>;
};

export const useRegister = (params: UseRegisterParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.clear();
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
