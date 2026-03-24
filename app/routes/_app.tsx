import type { Route } from "./+types/_app";

import { Outlet, redirect } from "react-router";

import {
  listHouseholdsForUser,
  pickPreferredHousehold,
} from "~/auth/household.server";
import { getStoredActiveHouseholdId } from "~/auth/active-household.server";
import { requireUser } from "~/auth/session.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { AppShell } from "~/ui/AppShell";

export async function loader({ request }: Route.LoaderArgs) {
  const anyUser = await usersStatsRepo.hasAnyUsers();
  if (!anyUser) return redirect("/setup");

  const user = await requireUser(request);
  const households = await listHouseholdsForUser(user.id);
  const preferredHouseholdId = pickPreferredHousehold({
    households,
    preferredHouseholdId: await getStoredActiveHouseholdId(request),
  })?.householdId ?? null;
  return {
    user,
    households,
    defaultHouseholdId: households[0]?.householdId ?? null,
    preferredHouseholdId,
  };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell
      user={{
        username: loaderData.user.username,
        isAdmin: loaderData.user.isAdmin,
        households: loaderData.households,
        defaultHouseholdId: loaderData.defaultHouseholdId,
        preferredHouseholdId: loaderData.preferredHouseholdId,
      }}
    >
      <Outlet />
    </AppShell>
  );
}
