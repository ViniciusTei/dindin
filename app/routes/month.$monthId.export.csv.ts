import type { Route } from "./+types/month.$monthId.export.csv";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { getMonthExportCsvModel } from "~/features/month/view-model.server";

function csvEscape(value: string): string {
  if (value.includes("\"")) value = value.replaceAll('"', '""');
  if (/[\n\r,\"]/g.test(value)) return `"${value}"`;
  return value;
}

function toLine(values: Array<string | number | null | undefined>): string {
  return values
    .map((v) => (v == null ? "" : csvEscape(String(v))))
    .join(",");
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);
  const monthId = String(params.monthId);

  const { month, members, incomes, categories, expenses, transfers } =
    await getMonthExportCsvModel({ monthId, householdId });

  const catById = new Map(categories.map((c) => [c.id, c.name] as const));
  const userNameById = new Map(members.map((m) => [m.userId, m.username] as const));

  const lines: string[] = [];
  lines.push(toLine(["month", month.ym]));
  lines.push("");

  lines.push("[incomes]");
  lines.push(toLine(["username", "amount_cents"]));
  for (const row of incomes) {
    lines.push(toLine([userNameById.get(row.userId) ?? row.userId, row.amountCents]));
  }
  lines.push("");

  lines.push("[expenses]");
  lines.push(toLine(["description", "category", "amount_cents", "is_paid"]));
  for (const e of expenses) {
    lines.push(toLine([e.description, catById.get(e.categoryId ?? "") ?? "", e.amountCents, e.isPaid ? 1 : 0]));
  }
  lines.push("");

  lines.push("[transfers]");
  lines.push(toLine(["from", "to", "amount_cents", "completed_at"]));
  for (const t of transfers) {
    lines.push(
      toLine([
        userNameById.get(t.fromUserId) ?? t.fromUserId,
        userNameById.get(t.toUserId) ?? t.toUserId,
        t.amountCents,
        t.completedAt ? t.completedAt.toISOString() : "",
      ])
    );
  }

  const csv = lines.join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=financeiro-${month.ym}.csv`,
    },
  });
}
