import type { User } from "@/generated/prisma/client";
import type { UserSummary } from "@/app/features/auth/types/auth.type";

export function serializeUser(user: User): UserSummary {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    address: user.address,
  };
}
