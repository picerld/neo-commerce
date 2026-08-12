import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { LoginRequest, UserSummary } from "../types/auth.type";

export async function login(data: LoginRequest): Promise<UserSummary> {
  return apiFetch<UserSummary>("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
}

type UseLoginParams = {
  mutationConfig?: MutationConfig<typeof login>;
};

export const useLogin = (params: UseLoginParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.clear();
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
