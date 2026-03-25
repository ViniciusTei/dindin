import type { Route } from "./+types/setup";
import crypto from "node:crypto";

import { createUserSession } from "~/auth/session.server";
import { passwordHasher } from "~/auth/password-hasher.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { usersRepo } from "~/db/repositories/users.repo.server";
import { runSetup } from "~/domain/setup/usecases/run-setup";
import { SetupPage } from "~/domain/setup/ui/SetupPage";

function createId(): string {
  return crypto.randomUUID();
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const result = await runSetup({
    usersStatsRepo,
    usersRepo,
    passwordHasher,
    householdsRepo,
    idFactory: createId,
    username,
    password,
    householdName: "Casa",
  });

  if (!result.ok) {
    switch (result.error) {
      case "ALREADY_DONE":
        return new Response("Setup já realizado", { status: 403 });
      case "INVALID_INPUT":
        return { error: "Informe usuário e senha (mín. 8)." };
      case "USER_EXISTS":
        return { error: "Usuário já existe." };
    }
  }

  return createUserSession({ userId: result.adminUserId, redirectTo: "/" });
}

export default function Setup({ actionData }: Route.ComponentProps) {
  return <SetupPage error={actionData?.error} />;
}
