import { Link } from "react-router";

import type { HouseholdSummary } from "~/domain/households/entity";
import { formatBRL } from "~/lib/money";
import HouseholdCreateModal from "./HouseholdCreateModal";

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

export function HouseholdsPage(props: {
  monthLabel: string;
  households: HouseholdSummary[];
  error?: string;
}) {
  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Households</h1>
          <p className="text-sm opacity-70">Resumo do mês {props.monthLabel}</p>
        </div>
        <HouseholdCreateModal error={props.error} />
      </div>

      <section className="bg-base-100 shadow mt-6">
        {props.households.length === 0 ? (
          <p className="opacity-70">
            Você ainda não participa de nenhuma household.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {props.households.map((household) => (
              <article
                key={household.householdId}
                className="rounded-box border border-base-300 bg-base-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{household.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="badge badge-outline">
                        {household.role === "admin" ? "Admin" : "Membro"}
                      </span>
                      <span className="badge badge-ghost">
                        {household.memberCount} membro(s)
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="opacity-70">Seu rateio</div>
                    <div className="font-semibold">
                      {formatShareBps(household.currentUserEffectiveShareBps)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm">
                  <div className="opacity-70">Despesas do mês</div>
                  <div className="text-lg font-semibold">
                    {formatBRL(-household.currentMonthExpenseCents)}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    className="btn btn-ghost btn-sm"
                    to={`/households/${household.householdId}?month=${props.monthLabel}`}
                  >
                    Detalhes
                  </Link>
                  {household.role === "admin" ? (
                    <Link
                      className="btn btn-primary btn-sm"
                      to={`/households/${household.householdId}/manage`}
                    >
                      Gerenciar
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
