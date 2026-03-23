import { describe, expect, it } from "vitest";

import { makeHouseholdsRepo } from "~/domain/test/fakes";

import { updateHouseholdMemberRole } from "./update-household-member-role";

describe("domain/households/updateHouseholdMemberRole", () => {
  it("impede rebaixar o último admin", async () => {
    const { repo } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [{ userId: "u1", username: "maria", role: "admin" }],
      },
    });

    const result = await updateHouseholdMemberRole({
      householdsRepo: repo,
      householdId: "h1",
      userId: "u1",
      role: "member",
    });

    expect(result).toEqual({ ok: false, error: "LAST_ADMIN" });
  });

  it("atualiza o papel quando há outro admin", async () => {
    const { repo, membersByHousehold } = makeHouseholdsRepo({
      membersByHousehold: {
        h1: [
          { userId: "u1", username: "maria", role: "admin" },
          { userId: "u2", username: "joao", role: "admin" },
        ],
      },
    });

    const result = await updateHouseholdMemberRole({
      householdsRepo: repo,
      householdId: "h1",
      userId: "u1",
      role: "member",
    });

    expect(result).toEqual({ ok: true });
    expect(membersByHousehold.get("h1")?.find((member) => member.userId === "u1")?.role).toBe("member");
  });
});
