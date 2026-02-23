import type { MonthsRepo } from "../ports";

export async function listMonths(params: {
  monthsRepo: MonthsRepo;
  householdId: string;
}) {
  return params.monthsRepo.listByHousehold(params.householdId);
}
