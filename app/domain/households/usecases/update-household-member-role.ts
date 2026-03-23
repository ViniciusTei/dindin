import type { MembershipRole } from "~/domain/households/entity";
import type { HouseholdsRepo } from "~/domain/households/ports";

export type UpdateHouseholdMemberRoleResult =
  | { ok: true }
  | {
      ok: false;
      error: "ROLE_INVALID" | "NOT_FOUND" | "LAST_ADMIN";
    };

function isValidRole(role: string): role is MembershipRole {
  return role === "admin" || role === "member";
}

export async function updateHouseholdMemberRole(params: {
  householdsRepo: HouseholdsRepo;
  householdId: string;
  userId: string;
  role: string;
}): Promise<UpdateHouseholdMemberRoleResult> {
  if (!isValidRole(params.role)) {
    return { ok: false, error: "ROLE_INVALID" };
  }

  const members = await params.householdsRepo.listMembers(params.householdId);
  const member = members.find((item) => item.userId === params.userId);
  if (!member) {
    return { ok: false, error: "NOT_FOUND" };
  }

  const adminCount = members.filter((item) => item.role === "admin").length;
  if (member.role === "admin" && params.role !== "admin" && adminCount === 1) {
    return { ok: false, error: "LAST_ADMIN" };
  }

  const updated = await params.householdsRepo.updateMemberRole({
    householdId: params.householdId,
    userId: params.userId,
    role: params.role,
  });

  if (!updated) {
    return { ok: false, error: "NOT_FOUND" };
  }

  return { ok: true };
}
