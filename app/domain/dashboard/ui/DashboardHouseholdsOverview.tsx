import { Link } from "react-router";

import type { DashboardHouseholdSummary } from "~/domain/dashboard/entity";
import { formatBRL } from "~/lib/money";

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

export function DashboardHouseholdsOverview(props: {
  householdSummaries: DashboardHouseholdSummary[];
  monthLabel: string;
}) {
  return (
    <section className="mt-6 card bg-base-100 shadow">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="card-title">Households</h2>
            <p className="text-sm opacity-70">
              Resumo das households no mês {props.monthLabel}.
            </p>
          </div>
          <Link className="btn btn-ghost btn-sm" to="/households">
            Ver todas
          </Link>
        </div>

        {props.householdSummaries.length === 0 ? (
          <p className="opacity-70">Você ainda não participa de nenhuma household.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {props.householdSummaries.map((household) => (
              <article key={household.householdId} className="rounded-box border border-base-300 bg-base-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{household.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="badge badge-outline">{household.role === "admin" ? "Admin" : "Membro"}</span>
                      <span className="badge badge-ghost">{household.memberCount} membro(s)</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="opacity-70">Seu rateio</div>
                    <div className="font-semibold">{formatShareBps(household.currentUserEffectiveShareBps)}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm opacity-70">Despesas do mês</div>
                    <div className="text-lg font-semibold">{formatBRL(-household.currentMonthExpenseCents)}</div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      className="btn btn-ghost btn-sm"
                      to={`/households/${household.householdId}?month=${props.monthLabel}`}
                    >
                      Detalhes
                    </Link>
                    {household.role === "admin" ? (
                      <Link className="btn btn-primary btn-sm" to={`/households/${household.householdId}/manage`}>
                        Gerenciar
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
