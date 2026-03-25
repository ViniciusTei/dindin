import { describe, expect, it } from "vitest";

import { makeHouseholdsRepo } from "~/domain/test/fakes";

import { addHouseholdMemberByUsername } from "./add-household-member-by-username";

describe("domain/households/addHouseholdMemberByUsername", () => {
  it("falha quando username é vazio", async () => {
    const { repo } = makeHouseholdsRepo();

    const result = await addHouseholdMemberByUsername({
      householdsRepo: repo,
      householdId: "h1",
      username: "   ",
      role: "member",
    });

    expect(result).toEqual({ ok: false, error: "USERNAME_REQUIRED" });
  });

  it("falha quando usuário não existe", async () => {
    const { repo } = makeHouseholdsRepo();

    const result = await addHouseholdMemberByUsername({
      householdsRepo: repo,
      householdId: "h1",
      username: "nope",
      role: "member",
    });

    expect(result).toEqual({ ok: false, error: "USER_NOT_FOUND" });
  });

  it("adiciona membro existente com o papel informado", async () => {
    const { repo, membersByHousehold } = makeHouseholdsRepo({
      users: [
        { id: "u1", username: "maria" },
        { id: "u2", username: "joao" },
      ],
      membersByHousehold: {
        h1: [{ userId: "u1", username: "maria", role: "admin" }],
      },
    });

    const result = await addHouseholdMemberByUsername({
      householdsRepo: repo,
      householdId: "h1",
      username: "joao",
      role: "member",
    });

    expect(result).toEqual({ ok: true });
    expect(membersByHousehold.get("h1")?.map((member) => ({ userId: member.userId, role: member.role }))).toEqual([
      { userId: "u1", role: "admin" },
      { userId: "u2", role: "member" },
    ]);
  });

  it("falha quando usuário já é membro", async () => {
    const { repo } = makeHouseholdsRepo({
      users: [{ id: "u1", username: "maria" }],
      membersByHousehold: {
        h1: [{ userId: "u1", username: "maria", role: "admin" }],
      },
    });

    const result = await addHouseholdMemberByUsername({
      householdsRepo: repo,
      householdId: "h1",
      username: "maria",
      role: "admin",
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_MEMBER" });
  });
});
