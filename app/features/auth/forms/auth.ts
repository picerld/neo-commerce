import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

export const registerFormSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  email: z.email({ message: "Email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  phone: z.string().min(8, { message: "Nomor HP tidak valid" }),
});
