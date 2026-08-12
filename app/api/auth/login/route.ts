import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginFormSchema } from "@/app/features/auth/forms/auth";
import { serializeUser } from "../serialize";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginFormSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError("Email atau password salah", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return apiError("Email atau password salah", 401);
    }

    await createSession({ userId: user.id, role: user.role, name: user.name });

    return apiSuccess(serializeUser(user), "Berhasil masuk");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
