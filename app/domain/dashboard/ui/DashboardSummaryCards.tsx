import { formatBRL } from "~/lib/money";

export function DashboardSummaryCards(props: {
  totalBalanceCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthNetCents: number;
}) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <section className="card bg-base-100 shadow">
        <div className="card-body gap-2">
          <div className="text-sm opacity-70">Saldo total</div>
          <div className="text-2xl font-semibold">{formatBRL(props.totalBalanceCents)}</div>
          <div className="text-xs opacity-70">Saldo atual das contas</div>
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body gap-3">
          <div className="text-sm opacity-70">Mês exibido</div>
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
  );
}
