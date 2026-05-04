import type { Route } from "./+types/settings.change-password";
import { redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { passwordHasher } from "~/auth/password-hasher.server";
import { passwordVerifier } from "~/auth/password-verifier.server";
import { userPasswordRepo } from "~/db/repositories/users.repo.server";
import { changePassword } from "~/domain/users/usecases/change-password";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "A nova senha deve ter pelo menos 8 caracteres.",
  WRONG_CURRENT_PASSWORD: "Senha atual incorreta.",
  SAME_PASSWORD: "A nova senha deve ser diferente da senha atual.",
};

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);

  const form = await request.formData();
  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");

  const result = await changePassword({
    userPasswordRepo,
    passwordVerifier,
    passwordHasher,
    userId: user.id,
    currentPasswordHash: user.passwordHash,
    currentPassword,
    newPassword,
  });

  if (!result.ok) {
    const msg = encodeURIComponent(ERROR_MESSAGES[result.error] ?? "Erro inesperado.");
    return redirect(`/settings?error=${msg}`);
  }

  return redirect("/settings?ok=change-password");
}
