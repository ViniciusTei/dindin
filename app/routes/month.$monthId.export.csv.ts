import type { Route } from "./+types/month.$monthId.export.csv";

import { and, eq, inArray } from "drizzle-orm";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { db } from "~/db/db.server";
import {
  categories,
  expenses,
  incomes,
  memberships,
  months,
  transfers,
  users,
} from "~/db/schema";

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

  const month = await db.query.months.findFirst({
    where: (t, { and, eq }) => and(eq(t.id, monthId), eq(t.householdId, householdId)),
  });
  if (!month) throw new Response("Mês não encontrado", { status: 404 });

  const memberRows = await db
    .select({ userId: memberships.userId, username: users.username })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.householdId, householdId));

  const memberUserIds = memberRows.map((m) => m.userId);

  const incomeRows = await db
    .select({ userId: incomes.userId, amountCents: incomes.amountCents })
    .from(incomes)
    .where(and(eq(incomes.monthId, monthId), inArray(incomes.userId, memberUserIds)));

  const cats = await db.query.categories.findMany({
    where: (t, { eq }) => eq(t.householdId, householdId),
  });
  const catById = new Map(cats.map((c) => [c.id, c.name] as const));

  const expenseRows = await db.query.expenses.findMany({
    where: (t, { eq }) => eq(t.monthId, monthId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });

  const transferRows = await db.query.transfers.findMany({
    where: (t, { eq }) => eq(t.monthId, monthId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });

  const userNameById = new Map(memberRows.map((m) => [m.userId, m.username] as const));

  const lines: string[] = [];
  lines.push(toLine(["month", month.ym]));
  lines.push("");

  lines.push("[incomes]");
  lines.push(toLine(["username", "amount_cents"]));
  for (const row of incomeRows) {
    lines.push(toLine([userNameById.get(row.userId) ?? row.userId, row.amountCents]));
  }
  lines.push("");

  lines.push("[expenses]");
  lines.push(toLine(["description", "category", "amount_cents", "is_paid"]));
  for (const e of expenseRows) {
    lines.push(toLine([e.description, catById.get(e.categoryId ?? "") ?? "", e.amountCents, e.isPaid ? 1 : 0]));
  }
  lines.push("");

  lines.push("[transfers]");
  lines.push(toLine(["from", "to", "amount_cents", "completed_at"]));
  for (const t of transferRows) {
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
