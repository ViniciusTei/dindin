import type { Route } from "./+types/join.$token";
import crypto from "node:crypto";

import { redirect } from "react-router";

import { passwordHasher } from "~/auth/password-hasher.server";
import { createUserSession, getUserId } from "~/auth/session.server";
import { invitesRepo } from "~/db/repositories/invites.repo.server";
import { acceptInviteLink } from "~/domain/invites/usecases/accept-invite-link";
import { registerUserFromInviteLink } from "~/domain/invites/usecases/register-user-from-invite-link";
import { JoinInvitePage } from "~/domain/invites/ui/JoinInvitePage";

function createId(): string {
  return crypto.randomUUID();
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = String(params.token);
  const userId = await getUserId(request);

  if (!userId) return {};

  const result = await acceptInviteLink(invitesRepo, { token, userId });
  if (!result.ok) {
    const reason = result.reason === "full" ? "Household já está cheio" : "Convite inválido";
    return new Response(reason, { status: 400 });
  }

  return redirect(`/households/${result.householdId}`);
}

export async function action({ request, params }: Route.ActionArgs) {
  const token = String(params.token);
  const userId = await getUserId(request);

  if (userId) {
    const result = await acceptInviteLink(invitesRepo, { token, userId });
    if (!result.ok) {
      const reason = result.reason === "full" ? "Household já está cheio" : "Convite inválido";
      return new Response(reason, { status: 400 });
    }

    return redirect(`/households/${result.householdId}`);
  }

  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const result = await registerUserFromInviteLink({
    invitesRepo,
    passwordHasher,
    idFactory: createId,
    token,
    username,
    password,
  });

  if (!result.ok) {
    switch (result.error) {
      case "INVALID_INPUT":
        return { error: "Informe usuário e senha (mín. 8)." };
      case "ALREADY_EXISTS":
        return { error: "Usuário já existe." };
      case "HOUSEHOLD_FULL":
        return { error: "Household já está cheia." };
      case "INVALID_INVITE":
        return { error: "Convite inválido." };
    }
  }

  return createUserSession({
    userId: result.userId,
    redirectTo: `/households/${result.householdId}`,
  });
}

export default function JoinInvite({ actionData }: Route.ComponentProps) {
  return <JoinInvitePage error={actionData?.error} />;
}
