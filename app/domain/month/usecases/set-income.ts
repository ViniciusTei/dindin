import type { MonthRepo } from "../ports";

export type SetIncomeResult =
  | { ok: true }
  | { ok: false; error: "USER_INVALID" };

export async function setIncome(params: {
  repo: MonthRepo;
  idFactory: () => string;
  monthId: string;
  userId: string;
  amountCents: number | null;
}): Promise<SetIncomeResult> {
  if (!params.userId) return { ok: false, error: "USER_INVALID" };

  if (params.amountCents == null) {
    await params.repo.deleteIncome({ monthId: params.monthId, userId: params.userId });
    return { ok: true };
  }

  await params.repo.upsertIncome({
    idFactory: params.idFactory,
    monthId: params.monthId,
    userId: params.userId,
    amountCents: params.amountCents,
  });

  return { ok: true };
}
