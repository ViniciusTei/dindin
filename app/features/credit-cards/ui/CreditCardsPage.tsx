import { Form, Link } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import { formatBRL } from "~/lib/money";

export type CreditCardListItem = {
  id: string;
  brand: string;
  last4: string;
  limitCents: number | null;
  closingDay: number;
  dueDay: number;
  accountId: string | null;
};

export function CreditCardsPage(props: {
  accounts: Account[];
  cards: CreditCardListItem[];
  error?: string;
  warning?: string;
  ok?: boolean;
}) {
  return (
    <main className="mx-auto mt-10 max-w-3xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Cartões</h1>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Cadastrar cartão</h2>

            <Form method="post" className="space-y-3">
              <input type="hidden" name="intent" value="create" />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="form-control">
                  <label className="label" htmlFor="number">
                    <span className="label-text">Número</span>
                  </label>
                  <input
                    id="number"
                    name="number"
                    placeholder="Ex.: 4111 1111 1111 1111"
                    className="input input-bordered w-full"
                    aria-invalid={props.error ? "true" : undefined}
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="expiration">
                    <span className="label-text">Validade (MM/AA)</span>
                  </label>
                  <input
                    id="expiration"
                    name="expiration"
                    placeholder="03/26"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="cvv">
                    <span className="label-text">CVV (opcional)</span>
                  </label>
                  <input id="cvv" name="cvv" className="input input-bordered w-full" />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="limit">
                    <span className="label-text">Limite (opcional)</span>
                  </label>
                  <input
                    id="limit"
                    name="limit"
                    placeholder="0,00"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="closingDay">
                    <span className="label-text">Dia de fechamento</span>
                  </label>
                  <input
                    id="closingDay"
                    name="closingDay"
                    type="number"
                    min={1}
                    max={31}
                    defaultValue={10}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="dueDay">
                    <span className="label-text">Dia de vencimento</span>
                  </label>
                  <input
                    id="dueDay"
                    name="dueDay"
                    type="number"
                    min={1}
                    max={31}
                    defaultValue={15}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label" htmlFor="accountId">
                    <span className="label-text">Conta para pagamento (opcional)</span>
                  </label>
                  <select id="accountId" name="accountId" className="select select-bordered w-full">
                    <option value="">(sem conta)</option>
                    {props.accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {props.error ? (
                <div role="alert" className="alert alert-error">
                  <span>{props.error}</span>
                </div>
              ) : null}

              {props.warning ? (
                <div role="alert" className="alert alert-warning">
                  <span>{props.warning}</span>
                </div>
              ) : null}

              {props.ok ? (
                <div role="status" className="alert alert-success">
                  <span>Salvo.</span>
                </div>
              ) : null}

              <button type="submit" className="btn btn-primary">
                Cadastrar
              </button>
            </Form>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Lista</h2>

            {props.cards.length === 0 ? (
              <p className="opacity-70">Nenhum cartão.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Cartão</th>
                      <th>Fechamento</th>
                      <th>Vencimento</th>
                      <th>Limite</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.cards.map((c) => (
                      <tr key={c.id}>
                        <td>
                          {c.brand} •••• {c.last4}
                        </td>
                        <td>Dia {c.closingDay}</td>
                        <td>Dia {c.dueDay}</td>
                        <td>{c.limitCents ? formatBRL(c.limitCents) : "—"}</td>
                        <td className="text-right">
                          <Link to={`/card/${c.id}`} className="btn btn-ghost btn-sm">
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
