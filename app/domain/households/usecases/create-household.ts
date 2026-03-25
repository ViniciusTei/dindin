import type { HouseholdsRepo } from "~/domain/households/ports";

export type CreateHouseholdResult =
  | { ok: true; householdId: string }
  | { ok: false; error: "NAME_REQUIRED" };

export async function createHousehold(params: {
  householdsRepo: HouseholdsRepo;
  idFactory: () => string;
  adminUserId: string;
  name: string;
}): Promise<CreateHouseholdResult> {
  const name = params.name.trim();
  if (!name) {
    return { ok: false, error: "NAME_REQUIRED" };
  }

  const { householdId } = await params.householdsRepo.createHousehold({
    id: params.idFactory(),
    adminUserId: params.adminUserId,
    name,
  });

  return { ok: true, householdId };
}
