import type { MonthRepo } from "../ports";

export type AddExpenseResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "DESCRIPTION_REQUIRED"
        | "CATEGORY_REQUIRED"
        | "AMOUNT_INVALID";
    };

export async function addExpense(params: {
  repo: MonthRepo;
  idFactory: () => string;
  monthId: string;
  description: string;
  categoryId: string;
  amountCents: number | null;
}): Promise<AddExpenseResult> {
  const description = params.description.trim();
  const categoryId = params.categoryId.trim();

  if (!description) return { ok: false, error: "DESCRIPTION_REQUIRED" };
  if (!categoryId) return { ok: false, error: "CATEGORY_REQUIRED" };
  if (params.amountCents == null || params.amountCents <= 0) {
    return { ok: false, error: "AMOUNT_INVALID" };
  }

  await params.repo.addExpense({
    idFactory: params.idFactory,
    monthId: params.monthId,
    categoryId,
    description,
    amountCents: params.amountCents,
  });

  return { ok: true };
}
