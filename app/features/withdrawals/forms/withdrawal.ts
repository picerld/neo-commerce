import { z } from "zod";

export const withdrawalFormSchema = z.object({
  amount: z.number().int().positive({ message: "Jumlah harus lebih dari 0" }),
  note: z.string(),
});
