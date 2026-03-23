import type { HouseholdsRepo } from "~/domain/households/ports";

export async function listUserHouseholds(params: {
  householdsRepo: HouseholdsRepo;
  userId: string;
  monthLabel: string;
}) {
  return params.householdsRepo.listSummariesForUser({
    userId: params.userId,
    monthLabel: params.monthLabel,
  });
}
