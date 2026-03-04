import { Form } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Transaction } from "~/domain/transactions/entity";
import { formatBRL } from "~/lib/money";

function centsToInput(cents: number): string {
  const abs = Math.abs(cents);
  return (abs / 100).toFixed(2).replace(".", ",");
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function TransactionsPage(props: {
  accounts: Account[];
  transactions: Array<Transaction & { accountName?: string }>;
  error?: string;
  ok?: boolean;
  today: string;
}) {
  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Transações</h1>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Criar transação</h2>

            <Form method="post" className="grid grid-cols-1 gap-3 md:grid-cols-6">
              <input type="hidden" name="intent" value="create" />

              <div className="form-control md:col-span-1">
                <label className="label" htmlFor="occurredAt">
                  <span className="label-text">Data</span>
                </label>
                <input
                  id="occurredAt"
                  name="occurredAt"
                  type="date"
                  defaultValue={props.today}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control md:col-span-1">
                <label className="label" htmlFor="type">
                  <span className="label-text">Tipo</span>
                </label>
                <select id="type" name="type" className="select select-bordered w-full" defaultValue="expense">
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label" htmlFor="accountId">
                  <span className="label-text">Conta</span>
                </label>
                <select id="accountId" name="accountId" className="select select-bordered w-full">
                  <option value="">Selecione…</option>
                  {props.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control md:col-span-1">
                <label className="label" htmlFor="amount">
                  <span className="label-text">Valor</span>
                </label>
                <input id="amount" name="amount" placeholder="0,00" className="input input-bordered w-full" />
              </div>

              <div className="form-control md:col-span-6">
                <label className="label" htmlFor="description">
                  <span className="label-text">Descrição</span>
                </label>
                <input
                  id="description"
                  name="description"
                  placeholder="Ex.: Mercado, Salário, Uber"
                  className="input input-bordered w-full"
                />
              </div>

              {props.error ? (
                <div role="alert" className="alert alert-error md:col-span-6">
                  <span>{props.error}</span>
                </div>
              ) : null}

              {props.ok ? (
                <div role="status" className="alert alert-success md:col-span-6">
                  <span>Salvo.</span>
                </div>
              ) : null}

              <div className="md:col-span-6">
                <button type="submit" className="btn btn-primary">
                  Criar
                </button>
              </div>
            </Form>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Lista</h2>

            {props.transactions.length === 0 ? (
              <p className="opacity-70">Nenhuma transação.</p>
            ) : (
              <div className="space-y-3">
                {props.transactions.map((t) => {
                  const displayCents = t.type === "expense" ? -t.amountCents : t.amountCents;

                  return (
                    <div key={t.id} className="rounded-box border border-base-300 p-3">
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                        <Form method="post" className="contents">
                          <input type="hidden" name="intent" value="update" />
                          <input type="hidden" name="transactionId" value={t.id} />

                          <div className="form-control md:col-span-2">
                            <label className="label" htmlFor={`occurredAt-${t.id}`}>
                              <span className="label-text">Data</span>
                            </label>
                            <input
                              id={`occurredAt-${t.id}`}
                              name="occurredAt"
                              type="date"
                              defaultValue={toDateInputValue(t.occurredAt)}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>

                          <div className="form-control md:col-span-2">
                            <label className="label" htmlFor={`type-${t.id}`}>
                              <span className="label-text">Tipo</span>
                            </label>
                            <select
                              id={`type-${t.id}`}
                              name="type"
                              className="select select-bordered select-sm w-full"
                              defaultValue={t.type}
                            >
                              <option value="expense">Despesa</option>
                              <option value="income">Receita</option>
                            </select>
                          </div>

                          <div className="form-control md:col-span-3">
                            <label className="label" htmlFor={`accountId-${t.id}`}>
                              <span className="label-text">Conta</span>
                            </label>
                            <select
                              id={`accountId-${t.id}`}
                              name="accountId"
                              className="select select-bordered select-sm w-full"
                              defaultValue={t.accountId}
                            >
                              {props.accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-control md:col-span-3">
                            <label className="label" htmlFor={`description-${t.id}`}>
                              <span className="label-text">Descrição</span>
                            </label>
                            <input
                              id={`description-${t.id}`}
                              name="description"
                              defaultValue={t.description}
                              className="input input-bordered input-sm w-full"
                            />
                          </div>

                          <div className="form-control md:col-span-2">
                            <label className="label" htmlFor={`amount-${t.id}`}>
                              <span className="label-text">Valor</span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                id={`amount-${t.id}`}
                                name="amount"
                                defaultValue={centsToInput(t.amountCents)}
                                className="input input-bordered input-sm w-full text-right"
                              />
                              <button type="submit" className="btn btn-ghost btn-sm">
                                Salvar
                              </button>
                            </div>
                            <div className="mt-1 text-xs opacity-70">{formatBRL(displayCents)}</div>
                          </div>
                        </Form>

                        <div className="md:col-span-12 flex justify-end">
                          <Form
                            method="post"
                            onSubmit={(e) => {
                              if (!window.confirm("Excluir esta transação?")) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="transactionId" value={t.id} />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Excluir
                            </button>
                          </Form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
