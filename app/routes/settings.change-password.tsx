import type { Route } from "./+types/settings.change-password";

import { requireUser } from "~/auth/session.server";
import { passwordHasher } from "~/auth/password-hasher.server";
import { passwordVerifier } from "~/auth/password-verifier.server";
import { userPasswordRepo } from "~/db/repositories/users.repo.server";
import { changePassword } from "~/domain/users/usecases/change-password";
import { ChangePasswordForm } from "~/domain/users/ui/ChangePasswordForm";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INPUT: "A nova senha deve ter pelo menos 8 caracteres.",
  WRONG_CURRENT_PASSWORD: "Senha atual incorreta.",
  SAME_PASSWORD: "A nova senha deve ser diferente da senha atual.",
};

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  return null;
}

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
    return { success: false, error: ERROR_MESSAGES[result.error] ?? "Erro inesperado." };
  }

  return { success: true, error: null };
}

export default function AccountChangePassword({ actionData }: Route.ComponentProps) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-6">Alterar senha</h1>
      <ChangePasswordForm error={actionData?.error} success={actionData?.success} />
    </div>
  );
}
