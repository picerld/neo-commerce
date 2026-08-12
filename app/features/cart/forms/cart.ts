import { z } from "zod";

export const addToCartFormSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1, { message: "Jumlah minimal 1" }),
});

export const updateCartItemFormSchema = z.object({
  quantity: z.number().int().min(1, { message: "Jumlah minimal 1" }),
});
