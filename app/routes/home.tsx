import type { Route } from "./+types/home";
import { redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { getExpenseByCategory, getMonthTotals } from "~/db/repositories/dashboard.repo.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { DashboardPage } from "~/features/dashboard/ui/DashboardPage";

function monthRangeUTC(date = new Date()): { start: Date; end: Date; label: string } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));
  const label = `${String(year)}-${String(month + 1).padStart(2, "0")}`;
  return { start, end, label };
}

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

  const { start, end, label } = monthRangeUTC();

  const [accounts, monthTotals, expenseByCategory] = await Promise.all([
    listAccounts({ accountsRepo, userId: user.id }),
    getMonthTotals({ userId: user.id, start, end }),
    getExpenseByCategory({ userId: user.id, householdId, start, end }),
  ]);

  const signedSumsById = await accountsRepo.sumSignedTransactionsByAccountIds({
    userId: user.id,
    accountIds: accounts.map((a) => a.id),
  });

  const totalBalanceCents = accounts.reduce(
    (acc, a) => acc + a.initialBalanceCents + (signedSumsById[a.id] ?? 0),
    0
  );

  const monthIncomeCents = monthTotals.incomeCents;
  const monthExpenseCents = monthTotals.expenseCents;
  const monthNetCents = monthIncomeCents - monthExpenseCents;

  return {
    monthLabel: label,
    totalBalanceCents,
    monthIncomeCents,
    monthExpenseCents,
    monthNetCents,
    expenseByCategory: expenseByCategory.map((x) => ({
      categoryName: x.categoryName,
      expenseCents: x.expenseCents,
    })),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <DashboardPage
      monthLabel={loaderData.monthLabel}
      totalBalanceCents={loaderData.totalBalanceCents}
      monthIncomeCents={loaderData.monthIncomeCents}
      monthExpenseCents={loaderData.monthExpenseCents}
      monthNetCents={loaderData.monthNetCents}
      expenseByCategory={loaderData.expenseByCategory}
    />
  );
}
