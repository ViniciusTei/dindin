import type { Route } from "./+types/households";
import crypto from "node:crypto";
import { redirect } from "react-router";

import { requireUserId } from "~/auth/session.server";
import { householdsRepo } from "~/db/repositories/households.repo.server";
import { resolveDashboardMonthLabel } from "~/domain/dashboard/month";
import { createHousehold } from "~/domain/households/usecases/create-household";
import { listUserHouseholds } from "~/domain/households/usecases/list-user-households";
import { HouseholdsPage } from "~/domain/households/ui/HouseholdsPage";

function createId(): string {
  return crypto.randomUUID();
}

export function meta() {
  return [{ title: "Rateios | Financeiro" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const monthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: url.searchParams.get("month"),
  });

  const households = await listUserHouseholds({
    householdsRepo,
    userId,
    monthLabel,
  });

  return { monthLabel, households };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const name = String(form.get("name") ?? "");

  const result = await createHousehold({
    householdsRepo,
    idFactory: createId,
    adminUserId: userId,
    name,
  });

  if (!result.ok) {
    return { error: "Nome é obrigatório." };
  }

  return redirect(`/households/${result.householdId}/manage`);
}

export default function Households({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <HouseholdsPage
      monthLabel={loaderData.monthLabel}
      households={loaderData.households}
      error={actionData?.error}
    />
  );
}
