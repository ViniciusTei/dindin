import { describe, expect, it, vi } from "vitest";

import { makeIdFactory, makePasswordHasher, makeUsersRepo } from "~/domain/test/fakes";

import { runSetup } from "./run-setup";

describe("domain/setup/runSetup", () => {

  it("cria admin e household quando ok", async () => {
    const { repo: usersRepo, users } = makeUsersRepo();
    const householdsRepo = { createHouseholdWithAdmin: vi.fn(async () => ({ householdId: "h1" })) };
    const idFactory = makeIdFactory("user");

    const result = await runSetup({
      usersRepo,
      passwordHasher: makePasswordHasher("argon"),
      householdsRepo,
      idFactory,
      username: " admin ",
      password: "password123",
      householdName: "Casa 1",
    });

    expect(result).toEqual({ ok: true, adminUserId: "user-1" });
    expect(users).toHaveLength(1);
    expect(users[0]?.username).toBe("admin");
    expect(users[0]?.isAdmin).toBe(true);
    expect(householdsRepo.createHouseholdWithAdmin).toHaveBeenCalledWith({
      adminUserId: "user-1",
      name: "Casa 1",
    });
  });
});
