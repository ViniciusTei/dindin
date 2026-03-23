import { describe, expect, it } from "vitest";

import { makeIdFactory, makeInvitesRepo, makePasswordHasher } from "~/domain/test/fakes";

import { registerUserFromInviteLink } from "./register-user-from-invite-link";

describe("registerUserFromInviteLink", () => {
  it("valida entrada mínima", async () => {
    const result = await registerUserFromInviteLink({
      invitesRepo: makeInvitesRepo(),
      passwordHasher: makePasswordHasher(),
      idFactory: makeIdFactory("user"),
      token: "token",
      username: " ",
      password: "123",
    });

    expect(result).toEqual({ ok: false, error: "INVALID_INPUT" });
  });

  it("mapeia username duplicado", async () => {
    const result = await registerUserFromInviteLink({
      invitesRepo: makeInvitesRepo({
        registerUser: { ok: false, reason: "username_taken" },
      }),
      passwordHasher: makePasswordHasher(),
      idFactory: makeIdFactory("user"),
      token: "token",
      username: "maria",
      password: "password123",
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });

  it("retorna userId e household ao criar conta a partir do convite", async () => {
    const result = await registerUserFromInviteLink({
      invitesRepo: makeInvitesRepo({
        registerUser: { ok: true, householdId: "household-9" },
      }),
      passwordHasher: makePasswordHasher("hash"),
      idFactory: makeIdFactory("user"),
      token: "token",
      username: "maria",
      password: "password123",
    });

    expect(result).toEqual({
      ok: true,
      userId: "user-1",
      householdId: "household-9",
    });
  });
});
