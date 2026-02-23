import { MonthAlreadyExistsError } from "../errors";
import type { MonthsRepo } from "../ports";
import { isYm, makeYm } from "../types";

export type CreateMonthResult =
  | { ok: true; monthId: string }
  | {
      ok: false;
      error:
        | "YEAR_MONTH_REQUIRED"
        | "YEAR_INVALID"
        | "MONTH_INVALID"
        | "YM_INVALID"
        | "ALREADY_EXISTS";
    };

export async function createMonth(params: {
  monthsRepo: MonthsRepo;
  householdId: string;
  year: string;
  month: string;
  idFactory: () => string;
}): Promise<CreateMonthResult> {
  const year = params.year.trim();
  const month = params.month.trim();

  if (!year || !month) return { ok: false, error: "YEAR_MONTH_REQUIRED" };
  if (!/^\d{4}$/.test(year)) return { ok: false, error: "YEAR_INVALID" };
  if (!/^(0[1-9]|1[0-2])$/.test(month)) return { ok: false, error: "MONTH_INVALID" };

  const ym = makeYm({ year, month });
  if (!ym || !isYm(`${year}-${month}`)) return { ok: false, error: "YM_INVALID" };

  const id = params.idFactory();
  try {
    await params.monthsRepo.create({ id, householdId: params.householdId, ym });
  } catch (error) {
    if (error instanceof MonthAlreadyExistsError) {
      return { ok: false, error: "ALREADY_EXISTS" };
    }
    throw error;
  }

  return { ok: true, monthId: id };
}
