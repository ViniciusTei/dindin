import type { MonthRepo } from "../ports";

export type DeleteExpenseResult =
  | { ok: true }
  | { ok: false; error: "EXPENSE_INVALID" };

export async function deleteExpense(params: {
  repo: MonthRepo;
  monthId: string;
  expenseId: string;
}): Promise<DeleteExpenseResult> {
  if (!params.expenseId) return { ok: false, error: "EXPENSE_INVALID" };

  await params.repo.deleteExpense({ monthId: params.monthId, expenseId: params.expenseId });
  return { ok: true };
}
