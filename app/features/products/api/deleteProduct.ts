import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import { getAdminProductsQueryKey } from "./getAdminProducts";

export async function deleteProduct(id: string): Promise<null> {
  return apiFetch<null>(`/api/admin/products/${id}`, { method: "DELETE" });
}

type UseDeleteProductParams = {
  mutationConfig?: MutationConfig<typeof deleteProduct>;
};

export const useDeleteProduct = (params: UseDeleteProductParams = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = params.mutationConfig ?? {};
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getAdminProductsQueryKey() });
      onSuccess?.(data, variables, onMutateResult, context);
    },
    ...restConfig,
  });
};
