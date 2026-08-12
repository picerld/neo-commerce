import { NextResponse } from "next/server";
import { ZodError, flattenError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { UnauthenticatedError } from "@/lib/auth/session";
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from "@/lib/errors";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export function apiSuccess<T>(data: T, message = "OK", status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, message, data }, { status });
}

export function apiError(message: string, status = 500, details?: unknown) {
  return NextResponse.json({ success: false, message, data: details ?? null }, { status });
}

export function apiErrorFromException(error: unknown) {
  if (error instanceof UnauthenticatedError) {
    return apiError(error.message, 401);
  }
  if (error instanceof ForbiddenError) {
    return apiError(error.message, 403);
  }
  if (error instanceof NotFoundError) {
    return apiError(error.message, 404);
  }
  if (error instanceof ConflictError) {
    return apiError(error.message, 409);
  }
  if (error instanceof ZodError) {
    return apiError("Validasi gagal", 400, flattenError(error));
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return apiError("Data dengan nilai ini sudah ada", 409);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    return apiError("Data ini masih dipakai oleh data lain dan tidak bisa dihapus", 409);
  }
  if (error instanceof BadRequestError) {
    return apiError(error.message, 400);
  }
  if (error instanceof Error) {
    return apiError(error.message, 500);
  }
  return apiError("Terjadi kesalahan", 500);
}
