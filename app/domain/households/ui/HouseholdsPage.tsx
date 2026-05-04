import type { HouseholdSummary } from "~/domain/households/entity";
import HouseholdCreateModal from "./HouseholdCreateModal";
import { HouseholdSummaryCard } from "./HouseholdSummaryCard";

export function HouseholdsPage(props: {
  monthLabel: string;
  households: HouseholdSummary[];
  error?: string;
}) {
  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Rateios</h1>
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
      </section>
    </main>
  );
}
