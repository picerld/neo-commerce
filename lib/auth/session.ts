import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { ForbiddenError } from "@/lib/errors";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthenticatedError";
  }
}

const SESSION_COOKIE = "neo_ecommerce_session";
const secretKey = process.env.SESSION_SECRET;
if (!secretKey) throw new Error("SESSION_SECRET is not set");
const encodedKey = new TextEncoder().encode(secretKey);

export type UserRole = "admin" | "user";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  name: string;
};

async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

async function decrypt(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, encodedKey, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Memoized per-request — safe to call from multiple server components/route handlers. */
export const getSession = cache(async () => {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
});

/** Route Handler guard — throws, letting the caller's try/catch map it via apiErrorFromException. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new UnauthenticatedError();
  return session;
}

/** Route Handler guard for a single role — throws ForbiddenError (403) if the role doesn't match. */
export async function requireRole(role: UserRole): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== role) throw new ForbiddenError(`This action requires the '${role}' role`);
  return session;
}

/** Server Component guard — redirects instead of throwing, since pages render straight to the user. */
export async function requirePageSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Server Component guard for a single role — redirects to that role's home instead of throwing. */
export async function requirePageRole(role: UserRole): Promise<SessionPayload> {
  const session = await requirePageSession();
  if (session.role !== role) redirect(session.role === "admin" ? "/admin" : "/");
  return session;
}
