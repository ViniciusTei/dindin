import type { Route } from "./+types/households_layout";

import { Outlet } from "react-router";

import { HouseholdContextBar } from "~/domain/households/ui/HouseholdContextBar";
import { HouseholdManageSidebar } from "~/domain/households/ui/HouseholdManageSidebar";
import { requireUserId } from "~/auth/session.server";
import { getRequestOrigin } from "~/lib/request.server";
import { resolveDashboardMonthLabel } from "~/domain/dashboard/month";
import { getHouseholdDetails } from "~/domain/households/usecases/get-household-details";
import { requireHouseholdAdmin } from "~/auth/household.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAdmin({ userId, householdId });

  const url = new URL(request.url);
  const monthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: url.searchParams.get("month"),
  });

  const household = await getHouseholdDetails({
    householdsRepo,
    userId,
    householdId,
    monthLabel,
    lookbackMonths: 1,
  });

  if (!household) {
    throw new Response("Household não encontrada.", { status: 404 });
  }

  return { household, origin: getRequestOrigin(request) };
}

export default function HouseholdLayout({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <HouseholdContextBar household={loaderData.household} />
      <div className="flex">
        <HouseholdManageSidebar
          householdId={loaderData.household.householdId}
          householdName={loaderData.household.name}
          role={loaderData.household.role}
        />
        <Outlet />
      </div>
    </>
  );
}
