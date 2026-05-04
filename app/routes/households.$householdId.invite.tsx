import type { Route } from "./+types/households.$householdId.invite";

import { requireHouseholdAdmin } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";
import { invitesRepo } from "~/db/repositories/invites.repo.server";
import { createInviteLink } from "~/domain/invites/usecases/create-invite-link";
import { InvitePage } from "~/domain/invites/ui/InvitePage";
import { getRequestOrigin } from "~/lib/request.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  const household = await requireHouseholdAdmin({ userId, householdId });

  return {
    origin: getRequestOrigin(request),
    householdContext: {
      householdId: household.householdId,
      name: household.name,
      role: household.role,
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAdmin({ userId, householdId });

  const { token, expiresAt } = await createInviteLink(invitesRepo, {
    householdId,
    createdByUserId: userId,
    ttlHours: 24,
  });

  return { token, expiresAt: expiresAt.toISOString() };
}

export default function HouseholdInvite({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <InvitePage
      origin={loaderData.origin}
      token={actionData?.token}
      expiresAt={actionData?.expiresAt}
      household={loaderData.householdContext}
    />
  );
}
