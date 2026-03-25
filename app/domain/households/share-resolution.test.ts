import { describe, expect, it } from "vitest";

import { resolveHouseholdPaymentShares } from "./share-resolution";

describe("domain/households/shareResolution", () => {
  it("divide automaticamente o restante entre membros sem percentual explícito", () => {
    const result = resolveHouseholdPaymentShares({
      memberUserIds: ["u1", "u2", "u3"],
      explicitShares: [{ userId: "u1", shareBps: 5_000 }],
    });

    expect(result).toEqual({
      ok: true,
      shares: [
        { userId: "u1", explicitShareBps: 5_000, effectiveShareBps: 5_000 },
        { userId: "u2", explicitShareBps: null, effectiveShareBps: 2_500 },
        { userId: "u3", explicitShareBps: null, effectiveShareBps: 2_500 },
      ],
    });
  });

  it("distribui sobras de forma determinística", () => {
    const result = resolveHouseholdPaymentShares({
      memberUserIds: ["u1", "u2", "u3"],
      explicitShares: [{ userId: "u1", shareBps: 3_333 }],
    });

    expect(result).toEqual({
      ok: true,
      shares: [
        { userId: "u1", explicitShareBps: 3_333, effectiveShareBps: 3_333 },
        { userId: "u2", explicitShareBps: null, effectiveShareBps: 3_334 },
        { userId: "u3", explicitShareBps: null, effectiveShareBps: 3_333 },
      ],
    });
  });

  it("falha quando a soma explícita ultrapassa 100%", () => {
    const result = resolveHouseholdPaymentShares({
      memberUserIds: ["u1", "u2"],
      explicitShares: [
        { userId: "u1", shareBps: 6_000 },
        { userId: "u2", shareBps: 5_000 },
      ],
    });

    expect(result).toEqual({ ok: false, error: "EXPLICIT_TOTAL_EXCEEDED" });
  });

  it("falha quando todos os membros têm percentual explícito e o total não fecha 100%", () => {
    const result = resolveHouseholdPaymentShares({
      memberUserIds: ["u1", "u2"],
      explicitShares: [
        { userId: "u1", shareBps: 4_000 },
        { userId: "u2", shareBps: 4_000 },
      ],
    });

    expect(result).toEqual({ ok: false, error: "TOTAL_MUST_EQUAL_100" });
  });
});
