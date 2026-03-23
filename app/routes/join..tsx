import type { Route } from "./+types/join.$token";

import { redirect } from "react-router";

import { requireUserId } from "~/auth/session.server";
import { invitesRepo } from "~/db/repositories/invites.repo.server";
import { acceptInviteLink } from "~/domain/invites/usecases/accept-invite-link";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const token = String(params.token);

  const result = await acceptInviteLink(invitesRepo, { token, userId });
  if (!result.ok) {
    const reason = result.reason === "full" ? "Household já está cheia" : "Convite inválido";
    return new Response(reason, { status: 400 });
  }

  return redirect("/");
}
