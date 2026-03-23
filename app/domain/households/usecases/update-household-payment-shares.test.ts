import { describe, expect, it } from "vitest";

import { makeHouseholdsRepo } from "~/domain/test/fakes";

import { updateHouseholdPaymentShares } from "./update-household-payment-shares";

describe("domain/households/updateHouseholdPaymentShares", () => {
  it("salva percentuais explícitos e resolve restante automaticamente", async () => {
    const { repo, sharesByHousehold } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [
          { userId: "u1", username: "maria", role: "admin" },
          { userId: "u2", username: "joao", role: "member" },
          { userId: "u3", username: "bia", role: "member" },
        ],
      },
    });

    const result = await updateHouseholdPaymentShares({
      householdsRepo: repo,
      householdId: "h1",
      shares: [
        { userId: "u1", shareBps: 5_000 },
        { userId: "u2", shareBps: 3_000 },
        { userId: "u3", shareBps: null },
      ],
    });

    expect(result.ok).toBe(true);
    expect(sharesByHousehold.get("h1")).toEqual([
      { userId: "u1", shareBps: 5_000 },
      { userId: "u2", shareBps: 3_000 },
    ]);
    expect(result).toEqual({
      ok: true,
      members: [
        {
          userId: "u1",
          username: "maria",
          role: "admin",
          createdAt: expect.any(Date),
          explicitShareBps: 5_000,
          effectiveShareBps: 5_000,
        },
        {
          userId: "u2",
          username: "joao",
          role: "member",
          createdAt: expect.any(Date),
          explicitShareBps: 3_000,
          effectiveShareBps: 3_000,
        },
        {
          userId: "u3",
          username: "bia",
          role: "member",
          createdAt: expect.any(Date),
          explicitShareBps: null,
          effectiveShareBps: 2_000,
        },
      ],
    });
  });

  it("falha quando usuário não pertence à household", async () => {
    const { repo } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [{ userId: "u1", username: "maria", role: "admin" }],
      },
    });

    const result = await updateHouseholdPaymentShares({
      householdsRepo: repo,
      householdId: "h1",
      shares: [{ userId: "u2", shareBps: 1_000 }],
    });

    expect(result).toEqual({ ok: false, error: "MEMBER_NOT_FOUND" });
  });

  it("falha quando soma explícita ultrapassa 100%", async () => {
    const { repo } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [
          { userId: "u1", username: "maria", role: "admin" },
          { userId: "u2", username: "joao", role: "member" },
        ],
      },
    });

    const result = await updateHouseholdPaymentShares({
      householdsRepo: repo,
      householdId: "h1",
      shares: [
        { userId: "u1", shareBps: 8_000 },
        { userId: "u2", shareBps: 3_000 },
      ],
    });

    expect(result).toEqual({ ok: false, error: "EXPLICIT_TOTAL_EXCEEDED" });
  });
});
