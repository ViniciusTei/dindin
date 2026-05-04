import { Link } from "react-router";

import type { DashboardHouseholdSummary } from "~/domain/dashboard/entity";
import { HouseholdSummaryCard } from "~/domain/households/ui/HouseholdSummaryCard";

export function DashboardHouseholdsOverview(props: {
  householdSummaries: DashboardHouseholdSummary[];
  monthLabel: string;
}) {
  return (
    <section className="mt-6 card bg-base-100 shadow">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="card-title">Rateios</h2>
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
              <HouseholdSummaryCard
                key={household.householdId}
                householdId={household.householdId}
                name={household.name}
                role={household.role}
                memberCount={household.memberCount}
                currentMonthExpenseCents={household.currentMonthExpenseCents}
                currentUserEffectiveShareBps={household.currentUserEffectiveShareBps}
                monthLabel={props.monthLabel}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
