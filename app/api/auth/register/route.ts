import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiErrorFromException } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { registerFormSchema } from "@/app/features/auth/forms/auth";
import { serializeUser } from "../serialize";

// Self-service registration always creates a `user` account — admin
// accounts exist only via prisma/seed.ts, never through this endpoint.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerFormSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return apiError("Email sudah terdaftar", 409);
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: "user",
      },
    });

    await createSession({ userId: user.id, role: user.role, name: user.name });

    return apiSuccess(serializeUser(user), "Akun berhasil dibuat", 201);
  } catch (error) {
    return apiErrorFromException(error);
  }
}
