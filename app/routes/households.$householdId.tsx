import type { Route } from "./+types/households.$householdId";

import { requireHouseholdAccess } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { resolveDashboardMonthLabel } from "~/domain/dashboard/month";
import { getHouseholdDetails } from "~/domain/households/usecases/get-household-details";
import { HouseholdDetailsPage } from "~/domain/households/ui/HouseholdDetailsPage";

export function meta() {
  return [{ title: "Detalhes da household | Financeiro" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAccess({ userId, householdId });

  const url = new URL(request.url);
  const monthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: url.searchParams.get("month"),
  });

  const household = await getHouseholdDetails({
    householdsRepo,
    userId,
    householdId,
    monthLabel,
    lookbackMonths: 6,
  });

  if (!household) {
    throw new Response("Household não encontrada.", { status: 404 });
  }

  return { household };
}

export default function HouseholdDetails({ loaderData }: Route.ComponentProps) {
  return <HouseholdDetailsPage household={loaderData.household} />;
}
