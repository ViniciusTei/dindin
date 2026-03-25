import type { MembershipRole } from "~/domain/households/entity";
import type { HouseholdsRepo } from "~/domain/households/ports";

export type AddHouseholdMemberByUsernameResult =
  | { ok: true }
  | {
      ok: false;
      error: "USERNAME_REQUIRED" | "ROLE_INVALID" | "USER_NOT_FOUND" | "ALREADY_MEMBER";
    };

function isValidRole(role: string): role is MembershipRole {
  return role === "admin" || role === "member";
}

export async function addHouseholdMemberByUsername(params: {
  householdsRepo: HouseholdsRepo;
  householdId: string;
  username: string;
  role: string;
}): Promise<AddHouseholdMemberByUsernameResult> {
  const username = params.username.trim();
  if (!username) {
    return { ok: false, error: "USERNAME_REQUIRED" };
  }

  if (!isValidRole(params.role)) {
    return { ok: false, error: "ROLE_INVALID" };
  }

  const user = await params.householdsRepo.findUserByUsername(username);
  if (!user) {
    return { ok: false, error: "USER_NOT_FOUND" };
  }

  const added = await params.householdsRepo.addMember({
    householdId: params.householdId,
    userId: user.id,
    role: params.role,
  });

  if (added === "already_member") {
    return { ok: false, error: "ALREADY_MEMBER" };
  }

  return { ok: true };
}
