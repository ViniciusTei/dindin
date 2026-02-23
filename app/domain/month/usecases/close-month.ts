import { computeDueByIncome, suggestTransfersToAdmin } from "~/lib/calc";

import type { MonthRepo } from "../ports";

export type CloseMonthResult =
  | { ok: true }
  | { ok: false; error: "NO_MEMBERS" };

export async function closeMonth(params: {
  repo: MonthRepo;
  idFactory: () => string;
  now: () => Date;
  householdId: string;
  monthId: string;
}): Promise<CloseMonthResult> {
  const memberRows = await params.repo.listMembers({ householdId: params.householdId });

  const admin = memberRows.find((m) => m.role === "admin");
  const adminUserId = admin?.userId ?? memberRows[0]?.userId;
  if (!adminUserId) return { ok: false, error: "NO_MEMBERS" };

  const memberUserIds = memberRows.map((m) => m.userId);
  const incomeRows = await params.repo.listIncomes({ monthId: params.monthId, userIds: memberUserIds });
  const incomeByUser = new Map(incomeRows.map((r) => [r.userId, r.amountCents] as const));

  const expenseRows = await params.repo.listExpenses({ monthId: params.monthId });
  const totalExpenseCents = expenseRows.reduce((acc, e) => acc + e.amountCents, 0);

  const dues = computeDueByIncome({
    members: memberRows.map((m) => ({
      userId: m.userId,
      incomeCents: incomeByUser.get(m.userId) ?? 0,
    })),
    totalExpenseCents,
  });

  const suggestions = suggestTransfersToAdmin({ adminUserId, dues });

  await params.repo.replaceTransfers({
    idFactory: params.idFactory,
    monthId: params.monthId,
    transfers: suggestions,
  });

  await params.repo.closeMonth({ monthId: params.monthId, closedAt: params.now() });

  return { ok: true };
}
