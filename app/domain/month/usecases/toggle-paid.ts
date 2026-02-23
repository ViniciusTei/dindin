import type { MonthRepo } from "../ports";

export type TogglePaidResult =
  | { ok: true }
  | { ok: false; error: "EXPENSE_INVALID" };

export async function togglePaid(params: {
  repo: MonthRepo;
  monthId: string;
  expenseId: string;
  isPaid: boolean;
}): Promise<TogglePaidResult> {
  if (!params.expenseId) return { ok: false, error: "EXPENSE_INVALID" };

  await params.repo.toggleExpensePaid({
    monthId: params.monthId,
    expenseId: params.expenseId,
    isPaid: params.isPaid,
  });

  return { ok: true };
}
