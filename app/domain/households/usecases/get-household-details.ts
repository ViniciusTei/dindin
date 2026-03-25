import type { HouseholdsRepo } from "~/domain/households/ports";

export async function getHouseholdDetails(params: {
  householdsRepo: HouseholdsRepo;
  userId: string;
  householdId: string;
  monthLabel: string;
  lookbackMonths?: number;
}) {
  return params.householdsRepo.getDetailsForUser({
    userId: params.userId,
    householdId: params.householdId,
    monthLabel: params.monthLabel,
    lookbackMonths: Math.max(1, Math.floor(params.lookbackMonths ?? 6)),
  });
}
