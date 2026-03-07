import type { Route } from "./+types/_app";

import { Outlet, redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { AppShell } from "~/ui/AppShell";

export async function loader({ request }: Route.LoaderArgs) {
  const anyUser = await usersStatsRepo.hasAnyUsers();
  if (!anyUser) return redirect("/setup");

  const user = await requireUser(request);
  return { user };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell
      user={{ username: loaderData.user.username, isAdmin: loaderData.user.isAdmin }}
    >
      <Outlet />
    </AppShell>
  );
}
