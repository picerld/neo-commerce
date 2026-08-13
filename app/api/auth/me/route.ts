import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
import { updateProfileFormSchema } from "@/app/features/auth/forms/auth";
import { serializeUser } from "../serialize";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return apiError("User tidak ditemukan", 404);
    }
    return apiSuccess(serializeUser(user));
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const data = updateProfileFormSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { name: data.name, phone: data.phone, address: data.address || null },
    });

    return apiSuccess(serializeUser(user), "Profil berhasil diperbarui");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
