import type { CategorySummary } from "@/app/features/categories/types/category.type";

export type ProductSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  category: CategorySummary | null;
  soldCount: number;
  createdAt: string;
};

export type ProductListParams = {
  search?: string;
  categorySlug?: string;
};

export type CreateProductRequest = {
  name: string;
  categoryId: string | null;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
};

export type UpdateProductRequest = CreateProductRequest;
