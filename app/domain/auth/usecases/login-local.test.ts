import { describe, expect, it } from "vitest";

import { makeAuthUsersRepo, makePasswordVerifier } from "~/domain/test/fakes";

import { loginLocal } from "./login-local";

describe("domain/auth/loginLocal", () => {
  it("retorna INVALID_LOGIN quando usuário não existe", async () => {
    const usersRepo = makeAuthUsersRepo({ users: [] });
    const passwordVerifier = makePasswordVerifier(() => true);

    const result = await loginLocal({
      usersRepo,
      passwordVerifier,
      username: "nope",
      password: "secret123",
    });

    expect(result).toEqual({ ok: false, error: "INVALID_LOGIN" });
  });

  it("retorna INVALID_LOGIN quando senha não confere", async () => {
    const usersRepo = makeAuthUsersRepo({
      users: [{ id: "u1", username: "alice", passwordHash: "hash" }],
    });
    const passwordVerifier = makePasswordVerifier(() => false);

    const result = await loginLocal({
      usersRepo,
      passwordVerifier,
      username: "alice",
      password: "wrong-password",
    });

    expect(result).toEqual({ ok: false, error: "INVALID_LOGIN" });
  });

  it("retorna userId quando login ok", async () => {
    const usersRepo = makeAuthUsersRepo({
      users: [{ id: "u1", username: "alice", passwordHash: "hash:secret" }],
    });
    const passwordVerifier = makePasswordVerifier(({ hash, password }) => hash === `hash:${password}`);

    const result = await loginLocal({
      usersRepo,
      passwordVerifier,
      username: "alice ",
      password: "secret",
    });

    expect(result).toEqual({ ok: true, userId: "u1" });
  });
});
