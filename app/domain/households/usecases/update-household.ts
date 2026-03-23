import type { HouseholdsRepo } from "~/domain/households/ports";

export type UpdateHouseholdResult =
  | { ok: true }
  | { ok: false; error: "NAME_REQUIRED" | "NOT_FOUND" };

export async function updateHousehold(params: {
  householdsRepo: HouseholdsRepo;
  householdId: string;
  name: string;
}): Promise<UpdateHouseholdResult> {
  const name = params.name.trim();
  if (!name) {
    return { ok: false, error: "NAME_REQUIRED" };
  }

  const updated = await params.householdsRepo.updateHouseholdName({
    householdId: params.householdId,
    name,
  });

  if (!updated) {
    return { ok: false, error: "NOT_FOUND" };
  }

  return { ok: true };
}
