import type { Route } from "./+types/invite";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { invitesRepo } from "~/db/repositories/invites.repo.server";
import { createInviteLink } from "~/domain/invites/usecases/create-invite-link";
import { InvitePage } from "~/domain/invites/ui/InvitePage";
import { getRequestOrigin } from "~/lib/request.server";

export async function loader({ request }: Route.LoaderArgs) {
  return { origin: getRequestOrigin(request) };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const { token, expiresAt } = await createInviteLink(invitesRepo, {
    householdId,
    createdByUserId: userId,
    ttlHours: 24,
  });

  return { token, expiresAt: expiresAt.toISOString() };
}

export default function Invite({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <InvitePage
      origin={loaderData.origin}
      token={actionData?.token}
      expiresAt={actionData?.expiresAt}
    />
  );
}
