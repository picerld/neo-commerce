import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import type { ChangePasswordRequest } from "../types/auth.type";

export async function changePassword(data: ChangePasswordRequest): Promise<null> {
  return apiFetch<null>("/api/auth/change-password", { method: "POST", body: JSON.stringify(data) });
}

type UseChangePasswordParams = {
  mutationConfig?: Omit<UseMutationOptions<null, Error, ChangePasswordRequest>, "mutationFn">;
};

export const useChangePassword = (params: UseChangePasswordParams = {}) =>
  useMutation({
    mutationFn: changePassword,
    ...params.mutationConfig,
  });
