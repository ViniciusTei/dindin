import { Link } from "react-router";

import { formatBRL } from "~/lib/money";

export function pluralMembros(n: number): string {
  return n === 1 ? "1 membro" : `${n} membros`;
}

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

type HouseholdSummaryCardProps = {
  householdId: string;
  name: string;
  role: "admin" | "member";
  memberCount: number;
  currentMonthExpenseCents: number;
  currentUserEffectiveShareBps: number;
  monthLabel: string;
};

export function HouseholdSummaryCard(props: HouseholdSummaryCardProps) {
  return (
    <article className="card bg-base-100 shadow border border-base-200 hover:border-primary transition-colors">
      <div className="card-body gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{props.name}</h3>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              <span className="badge badge-outline">
                {props.role === "admin" ? "Admin" : "Membro"}
              </span>
              <span className="badge badge-ghost">
                {pluralMembros(props.memberCount)}
              </span>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="opacity-70">Seu rateio</div>
            <div className="font-semibold">
              {formatShareBps(props.currentUserEffectiveShareBps)}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm opacity-70">Despesas do mês</div>
            <div className="text-lg font-semibold text-error">
              {formatBRL(-props.currentMonthExpenseCents)}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              className="btn btn-ghost btn-sm"
              to={`/households/${props.householdId}?month=${props.monthLabel}`}
            >
              Detalhes
            </Link>
            {props.role === "admin" ? (
              <Link
                className="btn btn-primary btn-sm"
                to={`/households/${props.householdId}/manage`}
              >
                Gerenciar
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
