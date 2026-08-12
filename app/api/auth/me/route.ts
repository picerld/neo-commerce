import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { requireSession } from "@/lib/auth/session";
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
