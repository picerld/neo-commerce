import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { changePasswordFormSchema } from "@/app/features/auth/forms/auth";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = changePasswordFormSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return apiError("User tidak ditemukan", 404);
    }

    const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValid) {
      return apiError("Password saat ini salah", 400);
    }

    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return apiSuccess(null, "Password berhasil diubah");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
