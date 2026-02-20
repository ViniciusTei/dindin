import type { Route } from "./+types/join.$token";

import { redirect } from "react-router";

import { acceptInviteLink } from "~/auth/invite.server";
import { requireUserId } from "~/auth/session.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const token = String(params.token);

  const result = await acceptInviteLink({ token, userId });
  if (!result.ok) {
    const reason = result.reason === "full" ? "Household já está cheio" : "Convite inválido";
    return new Response(reason, { status: 400 });
  }

  return redirect("/");
}
