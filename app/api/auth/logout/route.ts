import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { deleteSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await deleteSession();
    return apiSuccess(null, "Berhasil keluar");
  } catch (error) {
    return apiErrorFromException(error);
  }
}
