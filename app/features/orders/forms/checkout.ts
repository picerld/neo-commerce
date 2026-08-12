import { z } from "zod";

export const checkoutFormSchema = z.object({
  recipientName: z.string().min(1, { message: "Nama penerima wajib diisi" }),
  recipientPhone: z.string().min(8, { message: "Nomor HP tidak valid" }),
  shippingAddress: z.string().min(10, { message: "Alamat lengkap wajib diisi" }),
});
