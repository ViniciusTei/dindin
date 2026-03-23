import type { PasswordHasher } from "~/domain/users/ports";

import type { InvitesRepo } from "../ports";

export async function registerUserFromInviteLink(params: {
  invitesRepo: InvitesRepo;
  passwordHasher: PasswordHasher;
  idFactory: () => string;
  token: string;
  username: string;
  password: string;
}): Promise<
  | { ok: true; userId: string; householdId: string }
  | { ok: false; error: "INVALID_INPUT" | "ALREADY_EXISTS" | "INVALID_INVITE" | "HOUSEHOLD_FULL" }
> {
  const username = params.username.trim();
  const password = params.password;

  if (!username || password.length < 8) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const userId = params.idFactory();
  const passwordHash = await params.passwordHasher.hash(password);

  const result = await params.invitesRepo.registerUserFromInvite({
    token: params.token,
    userId,
    username,
    passwordHash,
  });

  if (!result.ok) {
    switch (result.reason) {
      case "username_taken":
        return { ok: false, error: "ALREADY_EXISTS" };
      case "full":
        return { ok: false, error: "HOUSEHOLD_FULL" };
      case "invalid":
        return { ok: false, error: "INVALID_INVITE" };
    }
  }

  return {
    ok: true,
    userId,
    householdId: result.householdId,
  };
}
