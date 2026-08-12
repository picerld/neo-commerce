import { prisma } from "@/lib/prisma";
import { apiSuccess, apiErrorFromException } from "@/lib/api-response";
import { requireRole } from "@/lib/auth/session";
import { ConflictError } from "@/lib/errors";
import { computeAvailableBalance } from "@/lib/withdrawals/balance";
import { withdrawalFormSchema } from "@/app/features/withdrawals/forms/withdrawal";
import type { WithdrawalsResponse } from "@/app/features/withdrawals/types/withdrawal.type";

export async function GET() {
  try {
    await requireRole("admin");

    const [records, { available }] = await Promise.all([
      prisma.withdrawalRecord.findMany({ include: { admin: true }, orderBy: { createdAt: "desc" } }),
      computeAvailableBalance(),
    ]);

    const response: WithdrawalsResponse = {
      records: records.map((record) => ({
        id: record.id,
        amount: record.amount,
        note: record.note,
        createdAt: record.createdAt.toISOString(),
        admin: { id: record.admin.id, name: record.admin.name },
      })),
      available,
    };

    return apiSuccess(response);
  } catch (error) {
    return apiErrorFromException(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole("admin");

    const body = await request.json();
    const data = withdrawalFormSchema.parse(body);

    const { available } = await computeAvailableBalance();
    if (data.amount > available) {
      throw new ConflictError(`Saldo tersedia hanya ${available}, tidak cukup untuk penarikan ini`);
    }

    const record = await prisma.withdrawalRecord.create({
      data: { adminId: session.userId, amount: data.amount, note: data.note || null },
      include: { admin: true },
    });

    return apiSuccess(
      {
        id: record.id,
        amount: record.amount,
        note: record.note,
        createdAt: record.createdAt.toISOString(),
        admin: { id: record.admin.id, name: record.admin.name },
      },
      "Penarikan dicatat",
      201,
    );
  } catch (error) {
    return apiErrorFromException(error);
  }
}
