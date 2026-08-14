import { z } from "zod";

const baseFields = {
  name: z.string().min(1, { message: "Nama produk wajib diisi" }),
  description: z.string(),
  price: z.number().int().min(0, { message: "Harga tidak boleh negatif" }),
  compareAtPrice: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0, { message: "Stok tidak boleh negatif" }),
  imageUrl: z.string(),
  isActive: z.boolean(),
};

function checkCompareAtPrice(data: { price: number; compareAtPrice: number | null }) {
  return data.compareAtPrice === null || data.compareAtPrice > data.price;
}

const compareAtPriceRefinementOptions = {
  message: "Harga coret harus lebih besar dari harga jual",
  path: ["compareAtPrice"],
};

/** Client form validator — `categoryId` is always a string in form state (a
 * sentinel value stands in for "no category"), mapped to `string | null`
 * only when building the API payload. */
export const productFormSchema = z
  .object({
    ...baseFields,
    categoryId: z.string(),
  })
  .refine(checkCompareAtPrice, compareAtPriceRefinementOptions);

/** API route validator — the client has already mapped the sentinel to `null`. */
export const productPayloadSchema = z
  .object({
    ...baseFields,
    categoryId: z.string().nullable(),
  })
  .refine(checkCompareAtPrice, compareAtPriceRefinementOptions);
