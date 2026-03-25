import type { PasswordHasher, UsersRepo } from "~/domain/users/ports";
import { createLocalUser } from "~/domain/users/usecases/create-local-user";

import type { SetupHouseholdsRepo, SetupUsersStatsRepo } from "../ports";

export type RunSetupResult =
  | { ok: true; adminUserId: string }
  | {
      ok: false;
      error: "ALREADY_DONE" | "INVALID_INPUT" | "USER_EXISTS";
    };

export async function runSetup(params: {
  usersStatsRepo: SetupUsersStatsRepo;
  usersRepo: UsersRepo;
  passwordHasher: PasswordHasher;
  householdsRepo: SetupHouseholdsRepo;
  idFactory: () => string;
  username: string;
  password: string;
  householdName?: string;
}): Promise<RunSetupResult> {

  const created = await createLocalUser({
    usersRepo: params.usersRepo,
    passwordHasher: params.passwordHasher,
    idFactory: params.idFactory,
    username: params.username,
    password: params.password,
    isAdmin: true,
  });

  if (!created.ok) {
    switch (created.error) {
      case "INVALID_INPUT":
        return { ok: false, error: "INVALID_INPUT" };
      case "ALREADY_EXISTS":
        return { ok: false, error: "USER_EXISTS" };
    }
  }

  // Mantém compatibilidade: nome default "Casa".
  await params.householdsRepo.createHouseholdWithAdmin({
    adminUserId: created.id,
    name: params.householdName ?? "Casa",
  });

  return { ok: true, adminUserId: created.id };
}
