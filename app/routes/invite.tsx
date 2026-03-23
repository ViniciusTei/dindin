import type { Route } from "./+types/invite";
import { redirect } from "react-router";

import { getDefaultHouseholdRouteForUser } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  return redirect(await getDefaultHouseholdRouteForUser({ userId, suffix: "/invite" }));
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  return redirect(await getDefaultHouseholdRouteForUser({ userId, suffix: "/invite" }));
}

export default function InviteLegacyRedirect() {
  return null;
}
