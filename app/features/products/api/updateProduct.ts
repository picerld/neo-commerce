import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { ProductSummary, UpdateProductRequest } from "../types/product.type";
import { getAdminProductsQueryKey } from "./getAdminProducts";

export async function updateProduct({ id, ...data }: UpdateProductRequest & { id: string }): Promise<ProductSummary> {
  return apiFetch<ProductSummary>(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

type UseUpdateProductParams = {
  mutationConfig?: MutationConfig<typeof updateProduct>;
};

export const useUpdateProduct = (params: UseUpdateProductParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getAdminProductsQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
