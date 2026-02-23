import type { Route } from "./+types/admin.users";
import crypto from "node:crypto";

import { requireAdmin } from "~/auth/session.server";
import { passwordHasher } from "~/auth/password-hasher.server";
import { usersRepo } from "~/db/repositories/users.repo.server";
import { createLocalUser } from "~/domain/users/usecases/create-local-user";
import { listUsers } from "~/domain/users/usecases/list-users";
import { AdminUsersPage } from "~/features/admin-users/ui/AdminUsersPage";

function createId(): string {
  return crypto.randomUUID();
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);

  const allUsers = await listUsers({ usersRepo });
  return { users: allUsers };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const isAdmin = form.get("isAdmin") === "on";

  const result = await createLocalUser({
    usersRepo,
    passwordHasher,
    idFactory: createId,
    username,
    password,
    isAdmin,
  });

  if (!result.ok) {
    switch (result.error) {
      case "INVALID_INPUT":
        return { error: "Informe usuário e senha (mín. 8)." };
      case "ALREADY_EXISTS":
        return { error: "Usuário já existe." };
    }
  }

  return { ok: true };
}

export default function AdminUsers({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <AdminUsersPage
      users={loaderData.users}
      error={actionData?.error}
      ok={actionData?.ok}
    />
  );
}
