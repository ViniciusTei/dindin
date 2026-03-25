import { describe, expect, it } from "vitest";

import { makeHouseholdsRepo } from "~/domain/test/fakes";

import { removeHouseholdMember } from "./remove-household-member";

describe("domain/households/removeHouseholdMember", () => {
  it("impede remover o último admin", async () => {
    const { repo } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [{ userId: "u1", username: "maria", role: "admin" }],
      },
    });

    const result = await removeHouseholdMember({
      householdsRepo: repo,
      householdId: "h1",
      userId: "u1",
    });

    expect(result).toEqual({ ok: false, error: "LAST_ADMIN" });
  });

  it("remove membro quando permitido", async () => {
    const { repo, membersByHousehold } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [
          { userId: "u1", username: "maria", role: "admin" },
          { userId: "u2", username: "joao", role: "member" },
        ],
      },
    });

    const result = await removeHouseholdMember({
      householdsRepo: repo,
      householdId: "h1",
      userId: "u2",
    });

    expect(result).toEqual({ ok: true });
    expect(membersByHousehold.get("h1")?.map((member) => member.userId)).toEqual(["u1"]);
  });
});
