import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export async function logout(): Promise<null> {
  return apiFetch<null>("/api/auth/logout", { method: "POST" });
}

type UseLogoutParams = {
  mutationConfig?: Omit<UseMutationOptions<null, Error, void>, "mutationFn">;
};

export const useLogout = (params: UseLogoutParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.clear();
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
