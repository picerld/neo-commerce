import { z } from "zod";

export const updateOrderStatusFormSchema = z.object({
  status: z.enum(["processing", "shipped", "completed", "refunded"]),
  trackingNumber: z.string().optional(),
});
