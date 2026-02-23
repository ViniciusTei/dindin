import type { Route } from "./+types/months";
import crypto from "node:crypto";
import { redirect } from "react-router";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { monthsRepo } from "~/db/repositories/months.repo.server";
import { createMonth } from "~/domain/months/usecases/create-month";
import { listMonths } from "~/domain/months/usecases/list-months";
import { MonthsPage } from "~/features/months/ui/MonthsPage";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const list = await listMonths({ monthsRepo, householdId });
  return { months: list };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const form = await request.formData();
  const ym = String(form.get("ym") ?? "").trim();
  const mm = String(form.get("mm") ?? "").trim();

  const result = await createMonth({
    monthsRepo,
    householdId,
    year: ym,
    month: mm,
    idFactory: () => crypto.randomUUID(),
  });

  if (!result.ok) {
    switch (result.error) {
      case "YEAR_MONTH_REQUIRED":
        return { error: "Ano e mês são obrigatórios." };
      case "YEAR_INVALID":
        return { error: "Ano deve conter 4 dígitos." };
      case "MONTH_INVALID":
        return { error: "Mês deve ser entre 01 e 12." };
      case "YM_INVALID":
        return { error: "Competência inválida (YYYY-MM)." };
      case "ALREADY_EXISTS":
        return { error: "Mês já existe." };
    }
  }

  return redirect(`/months/${result.monthId}`);
}

export default function Months({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return <MonthsPage months={loaderData.months} error={actionData?.error} />;
}
