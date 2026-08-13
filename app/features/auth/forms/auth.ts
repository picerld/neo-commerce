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

export const updateProfileFormSchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  phone: z.string().min(8, { message: "Nomor HP tidak valid" }),
  address: z.string(),
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Password saat ini wajib diisi" }),
    newPassword: z.string().min(8, { message: "Password baru minimal 8 karakter" }),
    confirmPassword: z.string().min(1, { message: "Konfirmasi password wajib diisi" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
