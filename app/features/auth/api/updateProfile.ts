import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { UpdateProfileRequest, UserSummary } from "../types/auth.type";
import { getMeQueryKey } from "./getMe";

export async function updateProfile(data: UpdateProfileRequest): Promise<UserSummary> {
  return apiFetch<UserSummary>("/api/auth/me", { method: "PATCH", body: JSON.stringify(data) });
}

type UseUpdateProfileParams = {
  mutationConfig?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = (params: UseUpdateProfileParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getMeQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
