import type { HouseholdMember } from "~/domain/households/entity";
import type { HouseholdsRepo } from "~/domain/households/ports";
import { resolveHouseholdPaymentShares } from "~/domain/households/share-resolution";

export type UpdateHouseholdPaymentSharesResult =
  | { ok: true; members: HouseholdMember[] }
  | {
      ok: false;
      error:
        | "MEMBER_NOT_FOUND"
        | "SHARE_INVALID"
        | "EXPLICIT_TOTAL_EXCEEDED"
        | "TOTAL_MUST_EQUAL_100";
    };

export async function updateHouseholdPaymentShares(params: {
  householdsRepo: HouseholdsRepo;
  householdId: string;
  shares: Array<{ userId: string; shareBps: number | null }>;
}): Promise<UpdateHouseholdPaymentSharesResult> {
  const members = await params.householdsRepo.listMembers(params.householdId);
  const memberByUserId = new Map(members.map((member) => [member.userId, member]));

  for (const share of params.shares) {
    if (!memberByUserId.has(share.userId)) {
      return { ok: false, error: "MEMBER_NOT_FOUND" };
    }
  }

  const explicitShares = params.shares
    .filter((share) => share.shareBps != null)
    .map((share) => ({ userId: share.userId, shareBps: share.shareBps ?? 0 }));

  const resolved = resolveHouseholdPaymentShares({
    memberUserIds: members.map((member) => member.userId),
    explicitShares,
  });

  if (!resolved.ok) {
    switch (resolved.error) {
      case "UNKNOWN_MEMBER":
        return { ok: false, error: "MEMBER_NOT_FOUND" };
      case "DUPLICATE_MEMBER":
      case "SHARE_INVALID":
        return { ok: false, error: "SHARE_INVALID" };
      case "EXPLICIT_TOTAL_EXCEEDED":
        return { ok: false, error: "EXPLICIT_TOTAL_EXCEEDED" };
      case "TOTAL_MUST_EQUAL_100":
        return { ok: false, error: "TOTAL_MUST_EQUAL_100" };
    }
  }

  await params.householdsRepo.replacePaymentShares({
    householdId: params.householdId,
    shares: explicitShares,
  });

  return {
    ok: true,
    members: resolved.shares.map((share) => {
      const member = memberByUserId.get(share.userId)!;
      return {
        ...member,
        explicitShareBps: share.explicitShareBps,
        effectiveShareBps: share.effectiveShareBps,
      };
    }),
  };
}
