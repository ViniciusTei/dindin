import type { HouseholdAccess } from "~/domain/households/entity";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { getStoredActiveHouseholdId } from "./active-household.server";

export async function listHouseholdsForUser(userId: string) {
  return householdsRepo.listForUser(userId);
}

export function pickPreferredHousehold(params: {
  households: HouseholdAccess[];
  preferredHouseholdId: string | null;
}) {
  return (
    params.households.find(
      (household) => household.householdId === params.preferredHouseholdId,
    ) ??
    params.households[0] ??
    null
  );
}

export async function getDefaultHouseholdForUser(userId: string) {
  const households = await householdsRepo.listForUser(userId);
  return households[0] ?? null;
}

export async function getPreferredHouseholdForUser(params: {
  request: Request;
  userId: string;
}) {
  const households = await householdsRepo.listForUser(params.userId);
  const preferredHouseholdId = await getStoredActiveHouseholdId(params.request);
  return pickPreferredHousehold({ households, preferredHouseholdId });
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
  request?: Request;
}): Promise<string> {
  const household = params.request
    ? await getPreferredHouseholdForUser({
        request: params.request,
        userId: params.userId,
      })
    : await getDefaultHouseholdForUser(params.userId);
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
