import type { HouseholdsRepo } from "~/domain/households/ports";

export type RemoveHouseholdMemberResult =
  | { ok: true }
  | { ok: false; error: "NOT_FOUND" | "LAST_ADMIN" };

export async function removeHouseholdMember(params: {
  householdsRepo: HouseholdsRepo;
  householdId: string;
  userId: string;
}): Promise<RemoveHouseholdMemberResult> {
  const members = await params.householdsRepo.listMembers(params.householdId);
  const member = members.find((item) => item.userId === params.userId);
  if (!member) {
    return { ok: false, error: "NOT_FOUND" };
  }

  const adminCount = members.filter((item) => item.role === "admin").length;
  if (member.role === "admin" && adminCount === 1) {
    return { ok: false, error: "LAST_ADMIN" };
  }

  const removed = await params.householdsRepo.removeMember({
    householdId: params.householdId,
    userId: params.userId,
  });

  if (!removed) {
    return { ok: false, error: "NOT_FOUND" };
  }

  return { ok: true };
}
