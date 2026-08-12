import type { ApiResponse } from "@/lib/api-response";

/** Carries the HTTP status so callers (notably queryClient's default
 * `retry`, which checks `error.status`) can distinguish a 4xx client error —
 * not worth retrying — from a transient 5xx/network failure. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    throw new ApiError(json.message || "Request gagal", res.status);
  }

  return json.data as T;
}
