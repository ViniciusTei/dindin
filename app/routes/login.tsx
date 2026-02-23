import type { Route } from "./+types/login";
import { redirect } from "react-router";

import { createUserSession, getUserId } from "~/auth/session.server";
import { passwordVerifier } from "~/auth/password-verifier.server";
import { authUsersRepo } from "~/db/repositories/users-auth.repo.server";
import { loginLocal } from "~/domain/auth/usecases/login-local";
import { LoginPage } from "~/features/auth/ui/LoginPage";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const result = await loginLocal({
    usersRepo: authUsersRepo,
    passwordVerifier,
    username,
    password,
  });

  if (!result.ok) return { error: "Login inválido" };
  return createUserSession({ userId: result.userId, redirectTo: "/" });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return <LoginPage error={actionData?.error} />;
}
