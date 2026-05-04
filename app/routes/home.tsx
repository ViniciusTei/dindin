import type { Route } from "./+types/home";
import { redirect } from "react-router";

import { getDefaultHouseholdForUser } from "~/auth/household.server";
import { requireUser } from "~/auth/session.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { dashboardRepo } from "~/db/repositories/dashboard.repo.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import {
  resolveDashboardMonthLabel,
  shiftDashboardMonthLabel,
} from "~/domain/dashboard/month";
import { getHomeDashboard } from "~/domain/dashboard/usecases/get-home-dashboard";
import { HomeDashboardPage } from "~/domain/dashboard/ui/HomeDashboardPage";
import { listUserHouseholds } from "~/domain/households/usecases/list-user-households";
import { formatDate } from "~/lib/datetime";

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
  const url = new URL(request.url);
  const selectedMonthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: url.searchParams.get("month"),
  });
  const defaultHousehold = await getDefaultHouseholdForUser(user.id);

  const [dashboard, householdSummaries] = await Promise.all([
    getHomeDashboard({
      userId: user.id,
      householdId: defaultHousehold?.householdId,
      selectedMonthLabel,
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 6,
    }),
    listUserHouseholds({
      householdsRepo,
      userId: user.id,
      monthLabel: selectedMonthLabel,
    }),
  ]);

  const availableMonths = Array.from({ length: 12 }, (_, i) => {
    const label = shiftDashboardMonthLabel(selectedMonthLabel, -(11 - i));
    return {
      label: formatDate(label, { format: "long", exclude: ["day"] }),
      link: `/?month=${label}`,
    };
  });

  return {
    ...dashboard,
    householdSummaries,
    availableMonths,
  };
}

export default function Home({ loaderData: props }: Route.ComponentProps) {
  return <HomeDashboardPage {...props} />;
}
