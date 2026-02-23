import { Form, Link } from "react-router";

import { formatBRL } from "~/lib/money";

import type {
  MonthDetailCategory,
  MonthDetailExpense,
  MonthDetailLoaderData,
  MonthDetailMember,
  MonthDetailMonth,
  MonthDetailTransfer,
} from "~/features/month/view-model.server";

export function MonthDetailPage(props: {
  month: MonthDetailMonth;
  members: MonthDetailMember[];
  incomes: MonthDetailLoaderData["incomes"];
  categories: MonthDetailCategory[];
  expenses: MonthDetailExpense[];
  totalExpenseCents: number;
  dues: MonthDetailLoaderData["dues"];
  transfers: MonthDetailTransfer[];
  error?: string;
}) {
  const dueByUser = new Map(props.dues.map((d) => [d.userId, d.dueCents] as const));

  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Mês {props.month.ym}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">Status</span>
          <span className="badge badge-outline">{props.month.status}</span>
        </div>
      </div>

      {props.error ? (
        <div role="alert" className="alert alert-error mt-4">
          <span>{props.error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Rendas</h2>
            <div className="space-y-3">
              {props.members.map((m) => (
                <Form method="post" key={m.userId} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <input type="hidden" name="intent" value="setIncome" />
                  <input type="hidden" name="userId" value={m.userId} />

                  <div className="w-full sm:w-44">
                    <div className="text-sm opacity-70">Usuário</div>
                    <div className="font-medium">{m.username}</div>
                  </div>

                  <div className="form-control w-full sm:max-w-xs">
                    <label className="label" htmlFor={`income-${m.userId}`}>
                      <span className="label-text">Renda</span>
                    </label>
                    <input
                      id={`income-${m.userId}`}
                      name="amount"
                      placeholder="0,00"
                      defaultValue={(() => {
                        const incomeCents = props.incomes[m.userId];
                        if (incomeCents == null) return "";
                        return String((incomeCents / 100).toFixed(2)).replace(".", ",");
                      })()}
                      disabled={props.month.status === "closed"}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <button type="submit" disabled={props.month.status === "closed"} className="btn btn-primary sm:btn-sm">
                    Salvar
                  </button>
                </Form>
              ))}
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Despesas</h2>

            <Form method="post" className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
              <input type="hidden" name="intent" value="addExpense" />

              <div className="form-control md:col-span-2">
                <label className="label" htmlFor="description">
                  <span className="label-text">Descrição</span>
                </label>
                <input id="description" name="description" disabled={props.month.status === "closed"} className="input input-bordered w-full" />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="categoryId">
                  <span className="label-text">Categoria</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  disabled={props.month.status === "closed"}
                  defaultValue=""
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {props.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="amount">
                  <span className="label-text">Valor</span>
                </label>
                <input id="amount" name="amount" placeholder="0,00" disabled={props.month.status === "closed"} className="input input-bordered w-full" />
              </div>

              <div className="md:col-span-4">
                <button type="submit" disabled={props.month.status === "closed"} className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </Form>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th className="text-right">Valor</th>
                    <th className="text-center">Pago</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {props.expenses.map((e) => (
                    <tr key={e.id}>
                      <td>{e.description}</td>
                      <td>{props.categories.find((c) => c.id === e.categoryId)?.name ?? ""}</td>
                      <td className="text-right">{formatBRL(e.amountCents)}</td>
                      <td className="text-center">
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="togglePaid" />
                          <input type="hidden" name="expenseId" value={e.id} />
                          <input
                            type="checkbox"
                            name="isPaid"
                            className="checkbox checkbox-sm"
                            defaultChecked={e.isPaid}
                            onChange={(ev) => {
                              const form = ev.currentTarget.form;
                              if (form) form.requestSubmit();
                            }}
                            disabled={props.month.status === "closed"}
                            aria-label="Marcar como paga"
                          />
                        </Form>
                      </td>
                      <td className="text-right">
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="deleteExpense" />
                          <input type="hidden" name="expenseId" value={e.id} />
                          <button type="submit" disabled={props.month.status === "closed"} className="btn btn-error btn-outline btn-sm">
                            Excluir
                          </button>
                        </Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Resumo</h2>
            <p>
              Total: <span className="font-medium">{formatBRL(props.totalExpenseCents)}</span>
            </p>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th className="text-right">Devido</th>
                    <th className="text-right">Renda</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {props.members.map((m) => {
                    const income = props.incomes[m.userId] ?? 0;
                    const due = dueByUser.get(m.userId) ?? 0;
                    const balance = income - due;
                    return (
                      <tr key={m.userId}>
                        <td>{m.username}</td>
                        <td className="text-right">{formatBRL(due)}</td>
                        <td className="text-right">{formatBRL(income)}</td>
                        <td className="text-right">{formatBRL(balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              {props.month.status === "open" ? (
                <Form method="post">
                  <input type="hidden" name="intent" value="close" />
                  <button type="submit" className="btn btn-primary">
                    Fechar mês
                  </button>
                </Form>
              ) : (
                <Form method="post">
                  <input type="hidden" name="intent" value="reopen" />
                  <button type="submit" className="btn btn-secondary">
                    Reabrir mês
                  </button>
                </Form>
              )}

              <a className="btn btn-outline" href={`/months/${props.month.id}/export.csv`} target="_blank" rel="noreferrer">
                Exportar CSV
              </a>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Transferências (sugeridas)</h2>
            {props.transfers.length === 0 ? <p className="opacity-70">Nenhuma (ainda).</p> : null}

            <ul className="space-y-2">
              {props.transfers.map((t) => (
                <li key={t.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-medium">
                      {props.members.find((m) => m.userId === t.fromUserId)?.username ?? t.fromUserId}
                    </span>{" "}
                    →{" "}
                    <span className="font-medium">
                      {props.members.find((m) => m.userId === t.toUserId)?.username ?? t.toUserId}
                    </span>
                    : <span className="font-mono">{formatBRL(t.amountCents)}</span>
                  </div>

                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="completeTransfer" />
                    <input type="hidden" name="transferId" value={t.id} />
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="completed"
                        className="checkbox checkbox-sm"
                        defaultChecked={Boolean(t.completedAt)}
                        onChange={(ev) => {
                          const form = ev.currentTarget.form;
                          if (form) form.requestSubmit();
                        }}
                      />
                      <span className="label-text">concluída</span>
                    </label>
                  </Form>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <Link className="btn btn-ghost btn-sm" to="/months">
          Voltar
        </Link>
      </div>
    </main>
  );
}
