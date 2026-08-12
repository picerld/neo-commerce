import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/query-client";
import { apiFetch } from "@/lib/http";
import type { CreateProductRequest, ProductSummary } from "../types/product.type";
import { getAdminProductsQueryKey } from "./getAdminProducts";

export async function createProduct(data: CreateProductRequest): Promise<ProductSummary> {
  return apiFetch<ProductSummary>("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
}

type UseCreateProductParams = {
  mutationConfig?: MutationConfig<typeof createProduct>;
};

export const useCreateProduct = (params: UseCreateProductParams = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: getAdminProductsQueryKey() });
      params.mutationConfig?.onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      params.mutationConfig?.onError?.(error, variables, onMutateResult, context);
    },
  });
};
