import { describe, expect, it } from "vitest";

import { makeIdFactory, makePasswordHasher, makeUsersRepo } from "~/domain/test/fakes";

import { createLocalUser } from "./create-local-user";

describe("domain/users/createLocalUser", () => {
  it("falha com INVALID_INPUT quando username vazio", async () => {
    const { repo: usersRepo } = makeUsersRepo();

    const result = await createLocalUser({
      usersRepo,
      passwordHasher: makePasswordHasher(),
      idFactory: makeIdFactory(),
      username: "   ",
      password: "password123",
      isAdmin: false,
    });

    expect(result).toEqual({ ok: false, error: "INVALID_INPUT" });
  });

  it("falha com INVALID_INPUT quando senha < 8", async () => {
    const { repo: usersRepo } = makeUsersRepo();

    const result = await createLocalUser({
      usersRepo,
      passwordHasher: makePasswordHasher(),
      idFactory: makeIdFactory(),
      username: "alice",
      password: "1234567",
      isAdmin: false,
    });

    expect(result).toEqual({ ok: false, error: "INVALID_INPUT" });
  });

  it("falha com ALREADY_EXISTS quando username já existe", async () => {
    const { repo: usersRepo } = makeUsersRepo({
      users: [{ id: "u1", username: "alice", isAdmin: false, createdAt: new Date() }],
    });

    const result = await createLocalUser({
      usersRepo,
      passwordHasher: makePasswordHasher(),
      idFactory: makeIdFactory(),
      username: "alice",
      password: "password123",
      isAdmin: false,
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });

  it("cria usuário quando ok", async () => {
    const { repo: usersRepo, users } = makeUsersRepo();

    const result = await createLocalUser({
      usersRepo,
      passwordHasher: makePasswordHasher("hash"),
      idFactory: makeIdFactory("user"),
      username: " alice ",
      password: "password123",
      isAdmin: true,
    });

    expect(result).toEqual({ ok: true, id: "user-1" });
    expect(users).toHaveLength(1);
    expect(users[0]?.username).toBe("alice");
    expect(users[0]?.isAdmin).toBe(true);
  });
});
