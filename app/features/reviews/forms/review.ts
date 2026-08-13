import { z } from "zod";

export const createReviewFormSchema = z.object({
  rating: z.number().min(1, { message: "Beri rating minimal 1 bintang" }).max(5),
  comment: z.string().max(1000, { message: "Ulasan maksimal 1000 karakter" }),
});
