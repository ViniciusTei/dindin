import type { Route } from "./+types/home";
import { redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { dashboardRepo } from "~/db/repositories/dashboard.repo.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { getHomeDashboard } from "~/domain/dashboard/usecases/get-home-dashboard";
import { HomeDashboardPage } from "~/domain/dashboard/ui/HomeDashboardPage";

export function meta() {
  return [
    { title: "Dashboard | Financeiro" },
    { name: "description", content: "Dashboard financeiro" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const anyUser = await usersStatsRepo.hasAnyUsers();
  if (!anyUser) return redirect("/setup");

  const user = await requireUser(request);
  const householdId = await requireHouseholdId(user.id);

  const dashboard = await getHomeDashboard({
    userId: user.id,
    householdId,
    dashboardRepo,
    accountsRepo,
    lookbackMonths: 6,
  });

  return dashboard;
}

export default function Home({ loaderData: props }: Route.ComponentProps) {
  return <HomeDashboardPage {...props} />;
}
