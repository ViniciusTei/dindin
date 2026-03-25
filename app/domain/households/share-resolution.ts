import type { HouseholdMember } from "./entity";

export type ResolvedHouseholdPaymentShare = Pick<
  HouseholdMember,
  "userId" | "explicitShareBps" | "effectiveShareBps"
>;

export type ResolveHouseholdPaymentSharesResult =
  | { ok: true; shares: ResolvedHouseholdPaymentShare[] }
  | {
      ok: false;
      error:
        | "UNKNOWN_MEMBER"
        | "DUPLICATE_MEMBER"
        | "SHARE_INVALID"
        | "EXPLICIT_TOTAL_EXCEEDED"
        | "TOTAL_MUST_EQUAL_100";
    };

export function resolveHouseholdPaymentShares(params: {
  memberUserIds: string[];
  explicitShares: Array<{ userId: string; shareBps: number }>;
}): ResolveHouseholdPaymentSharesResult {
  if (params.memberUserIds.length === 0) {
    return { ok: true, shares: [] };
  }

  const memberIds = new Set(params.memberUserIds);
  const explicitByUserId = new Map<string, number>();

  for (const share of params.explicitShares) {
    if (!memberIds.has(share.userId)) {
      return { ok: false, error: "UNKNOWN_MEMBER" };
    }

    if (explicitByUserId.has(share.userId)) {
      return { ok: false, error: "DUPLICATE_MEMBER" };
    }

    if (!Number.isInteger(share.shareBps) || share.shareBps < 0 || share.shareBps > 10_000) {
      return { ok: false, error: "SHARE_INVALID" };
    }

    explicitByUserId.set(share.userId, share.shareBps);
  }

  const explicitTotal = Array.from(explicitByUserId.values()).reduce((acc, shareBps) => acc + shareBps, 0);
  if (explicitTotal > 10_000) {
    return { ok: false, error: "EXPLICIT_TOTAL_EXCEEDED" };
  }

  const automaticMemberIds = params.memberUserIds.filter((userId) => !explicitByUserId.has(userId));
  if (automaticMemberIds.length === 0 && explicitTotal !== 10_000) {
    return { ok: false, error: "TOTAL_MUST_EQUAL_100" };
  }

  const remaining = 10_000 - explicitTotal;
  const automaticBase = automaticMemberIds.length > 0 ? Math.floor(remaining / automaticMemberIds.length) : 0;
  let automaticRemainder = automaticMemberIds.length > 0 ? remaining % automaticMemberIds.length : 0;

  const shares = params.memberUserIds.map((userId) => {
    const explicitShareBps = explicitByUserId.get(userId) ?? null;
    if (explicitShareBps != null) {
      return {
        userId,
        explicitShareBps,
        effectiveShareBps: explicitShareBps,
      };
    }

    const effectiveShareBps = automaticBase + (automaticRemainder > 0 ? 1 : 0);
    if (automaticRemainder > 0) automaticRemainder -= 1;

    return {
      userId,
      explicitShareBps: null,
      effectiveShareBps,
    };
  });

  return { ok: true, shares };
}
