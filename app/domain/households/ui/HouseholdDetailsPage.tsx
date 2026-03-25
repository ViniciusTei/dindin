import { Link } from "react-router";

import { DashboardExpensePieCard } from "~/domain/dashboard/ui/DashboardExpensePieCard";
import type { HouseholdDetails } from "~/domain/households/entity";
import { HouseholdExpenseTrendCard } from "~/domain/households/ui/HouseholdExpenseTrendCard";
import MonthSelect from "~/ui/MonthSelect";
import { formatBRL } from "~/lib/money";
import { formatDate } from "~/lib/datetime";

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

export function HouseholdDetailsPage(props: { household: HouseholdDetails }) {
  return (
    <main className="mx-auto mt-10 max-w-6xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{props.household.name}</h1>
            <span className="badge badge-outline">
              {props.household.role === "admin" ? "Admin" : "Membro"}
            </span>
          </div>
          <p className="text-sm opacity-70">
            Detalhes financeiros e composição da household.
          </p>
        </div>

        <div className="flex gap-4">
          <Link className="btn btn-ghost btn-sm" to="/households">
            Voltar
          </Link>
          {props.household.role === "admin" ? (
            <Link
              className="btn btn-primary btn-sm"
              to={`/households/${props.household.householdId}/manage`}
            >
              Gerenciar
            </Link>
          ) : null}

          <MonthSelect
            monthLabel={formatDate(props.household.monthLabel, {
              format: "long",
              exclude: ["day"],
            })}
            previousLink={`/households/${props.household.householdId}?month=${props.household.previousMonthLabel}`}
            nextLink={`/households/${props.household.householdId}?month=${props.household.nextMonthLabel}`}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Membros</div>
            <div className="text-2xl font-semibold">
              {props.household.memberCount}
            </div>
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Despesas do mês</div>
            <div className="text-2xl font-semibold">
              {formatBRL(-props.household.currentMonthExpenseCents)}
            </div>
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Seu rateio</div>
            <div className="text-2xl font-semibold">
              {formatShareBps(props.household.currentUserEffectiveShareBps)}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashboardExpensePieCard
          expenseByCategory={props.household.expenseByCategory}
        />
        <HouseholdExpenseTrendCard
          expenseSeries={props.household.expenseSeries}
          currentMonthExpenseCents={props.household.currentMonthExpenseCents}
        />
      </div>

      <section className="mt-6 card bg-base-100 shadow">
        <div className="card-body gap-4">
          <h2 className="card-title">Membros e rateio</h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Papel</th>
                  <th>Rateio explícito</th>
                  <th>Rateio efetivo</th>
                </tr>
              </thead>
              <tbody>
                {props.household.members.map((member) => (
                  <tr key={member.userId}>
                    <td>{member.username}</td>
                    <td>
                      {member.role === "admin" ? "Administrador" : "Membro"}
                    </td>
                    <td>
                      {member.explicitShareBps == null
                        ? "Automático"
                        : formatShareBps(member.explicitShareBps)}
                    </td>
                    <td>{formatShareBps(member.effectiveShareBps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
