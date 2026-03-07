import type { Route } from "./+types/home";
import { redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { getExpenseByCategory, getMonthTotals } from "~/db/repositories/dashboard.repo.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { formatBRL } from "~/lib/money";

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

export default function Home({ loaderData: props }: Route.ComponentProps) {
   const maxExpense = Math.max(0, ...props.expenseByCategory.map((x) => x.expenseCents));
  
    return (
      <main className="mx-auto mt-10 max-w-5xl px-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="text-sm opacity-70">{props.monthLabel}</div>
          </div>
        </div>
  
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-2">
              <div className="text-sm opacity-70">Saldo total</div>
              <div className="text-2xl font-semibold">{formatBRL(props.totalBalanceCents)}</div>
              <div className="text-xs opacity-70">Saldo inicial + receitas - despesas</div>
            </div>
          </section>
  
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-3">
              <div className="text-sm opacity-70">Mês</div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xs opacity-70">Receitas</div>
                  <div className="font-semibold">{formatBRL(props.monthIncomeCents)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Despesas</div>
                  <div className="font-semibold">{formatBRL(-props.monthExpenseCents)}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70">Resultado</div>
                  <div className="font-semibold">{formatBRL(props.monthNetCents)}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
  
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title">Despesas por categoria</h2>
  
              {props.expenseByCategory.length === 0 ? (
                <p className="opacity-70">Nenhuma despesa no mês.</p>
              ) : (
                <div className="space-y-3">
                  {props.expenseByCategory.slice(0, 8).map((row) => {
                    const pct = maxExpense > 0 ? Math.round((row.expenseCents / maxExpense) * 100) : 0;
                    return (
                      <div key={row.categoryName} className="space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate">{row.categoryName}</div>
                          <div className="font-semibold">{formatBRL(-row.expenseCents)}</div>
                        </div>
                        <div className="h-2 w-full rounded bg-base-200">
                          <div className="h-2 rounded bg-base-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
  
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title">Receitas vs despesas</h2>
  
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-70">Receitas</div>
                    <div className="font-semibold">{formatBRL(props.monthIncomeCents)}</div>
                  </div>
                  <progress
                    className="progress progress-neutral w-full"
                    value={props.monthIncomeCents}
                    max={Math.max(props.monthIncomeCents, props.monthExpenseCents, 1)}
                  />
                </div>
  
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-70">Despesas</div>
                    <div className="font-semibold">{formatBRL(-props.monthExpenseCents)}</div>
                  </div>
                  <progress
                    className="progress progress-neutral w-full"
                    value={props.monthExpenseCents}
                    max={Math.max(props.monthIncomeCents, props.monthExpenseCents, 1)}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
}
