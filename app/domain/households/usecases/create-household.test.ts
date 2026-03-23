import { describe, expect, it } from "vitest";

import { makeHouseholdsRepo, makeIdFactory } from "~/domain/test/fakes";

import { createHousehold } from "./create-household";

describe("domain/households/createHousehold", () => {
  it("falha quando nome é vazio", async () => {
    const { repo } = makeHouseholdsRepo();

    const result = await createHousehold({
      householdsRepo: repo,
      idFactory: makeIdFactory("household"),
      adminUserId: "user-1",
      name: "   ",
    });

    expect(result).toEqual({ ok: false, error: "NAME_REQUIRED" });
  });

  it("cria household com admin inicial", async () => {
    const { repo, accesses, membersByHousehold } = makeHouseholdsRepo({
      users: [{ id: "user-1", username: "maria" }],
    });

    const result = await createHousehold({
      householdsRepo: repo,
      idFactory: makeIdFactory("household"),
      adminUserId: "user-1",
      name: " Casa Azul ",
    });

    expect(result).toEqual({ ok: true, householdId: "household-1" });
    expect(accesses[0]).toMatchObject({ householdId: "household-1", name: "Casa Azul", role: "admin" });
    expect(membersByHousehold.get("household-1")).toEqual([
      {
        userId: "user-1",
        username: "maria",
        role: "admin",
        createdAt: expect.any(Date),
      },
    ]);
  });
});
