import { householdsRepo } from "~/db/repositories/households.repo.server";

export async function listHouseholdsForUser(userId: string) {
  return householdsRepo.listForUser(userId);
}

export async function getDefaultHouseholdForUser(userId: string) {
  const households = await householdsRepo.listForUser(userId);
  return households[0] ?? null;
}

export async function getHouseholdForUser(userId: string) {
  return getDefaultHouseholdForUser(userId);
}

export async function requireHouseholdId(userId: string): Promise<string> {
  const household = await getDefaultHouseholdForUser(userId);
  if (!household) throw new Response("Sem household", { status: 403 });
  return household.householdId;
}

export async function getDefaultHouseholdRouteForUser(params: {
  userId: string;
  suffix?: string;
}): Promise<string> {
  const household = await getDefaultHouseholdForUser(params.userId);
  if (!household) return "/households";
  return `/households/${household.householdId}${params.suffix ?? ""}`;
}

export async function requireHouseholdAccess(params: {
  userId: string;
  householdId: string;
}) {
  const access = await householdsRepo.findByIdForUser(params);
  if (!access) {
    throw new Response("Sem acesso à household", { status: 403 });
  }

  return access;
}

export async function requireHouseholdAdmin(params: {
  userId: string;
  householdId: string;
}) {
  const access = await requireHouseholdAccess(params);
  if (access.role !== "admin") {
    throw new Response("Apenas admins podem gerenciar esta household", { status: 403 });
  }

  return access;
}

export async function isUserMemberOfHousehold(params: {
  userId: string;
  householdId: string;
}): Promise<boolean> {
  const access = await householdsRepo.findByIdForUser(params);
  return Boolean(access);
}
