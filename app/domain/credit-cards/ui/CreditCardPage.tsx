import { Form, Link } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import { formatBRL } from "~/lib/money";

export type CreditCardDetail = {
  id: string;
  brand: string;
  last4: string;
  limitCents: number | null;
  closingDay: number;
  dueDay: number;
  accountId: string | null;
};

export type CreditCardPurchaseListItem = {
  id: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  occurredAtIso: string;
  installmentsTotal: number;
  firstInvoiceYm: string;
};

export type CreditCardInvoiceView = {
  ym: string;
  totalCents: number;
  lines: Array<{
    purchaseId: string;
    description: string;
    amountCentsThisYm: number;
    billedThisYm: number;
    totalInstallments: number;
  }>;
};

export function CreditCardPage(props: {
  accounts: Account[];
  categories: Category[];
  card: CreditCardDetail;
  invoice: CreditCardInvoiceView;
  purchases: CreditCardPurchaseListItem[];
  error?: string;
  warning?: string;
  ok?: boolean;
}) {
  return (
    <main className="mx-auto mt-10 max-w-4xl px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {props.card.brand} •••• {props.card.last4}
          </h1>
          <div className="mt-1 text-sm opacity-70">
            Fechamento: dia {props.card.closingDay} • Vencimento: dia {props.card.dueDay}
          </div>
        </div>
        <Link to="/cards" className="btn btn-ghost">
          Voltar
        </Link>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Configurações</h2>

            <Form method="post" className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input type="hidden" name="intent" value="update" />

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
                  defaultValue={props.card.closingDay}
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
                  defaultValue={props.card.dueDay}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="limit">
                  <span className="label-text">Limite (opcional)</span>
                </label>
                <input
                  id="limit"
                  name="limit"
                  placeholder="0,00"
                  defaultValue={props.card.limitCents ? (props.card.limitCents / 100).toFixed(2).replace(".", ",") : ""}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="accountId">
                  <span className="label-text">Conta para pagamento (opcional)</span>
                </label>
                <select
                  id="accountId"
                  name="accountId"
                  className="select select-bordered w-full"
                  defaultValue={props.card.accountId ?? ""}
                >
                  <option value="">(sem conta)</option>
                  {props.accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </Form>

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
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Fatura ({props.invoice.ym})</h2>

            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">Total</div>
              <div className="text-xl font-semibold">{formatBRL(props.invoice.totalCents)}</div>
            </div>

            {props.invoice.lines.length === 0 ? (
              <p className="opacity-70">Nenhum lançamento na fatura.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Compra</th>
                      <th>Parcelas (mês)</th>
                      <th>Valor (mês)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.invoice.lines.map((l) => (
                      <tr key={l.purchaseId}>
                        <td>{l.description}</td>
                        <td>
                          {l.billedThisYm}/{l.totalInstallments}
                        </td>
                        <td>{formatBRL(l.amountCentsThisYm)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Adicionar compra</h2>

            <Form method="post" className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input type="hidden" name="intent" value="purchase" />

              <div className="form-control md:col-span-2">
                <label className="label" htmlFor="description">
                  <span className="label-text">Descrição</span>
                </label>
                <input id="description" name="description" className="input input-bordered w-full" />
              </div>

              <div className="form-control md:col-span-2">
                <label className="label" htmlFor="categoryId">
                  <span className="label-text">Categoria</span>
                </label>
                <select id="categoryId" name="categoryId" className="select select-bordered w-full">
                  <option value="">Sem categoria</option>
                  {props.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="amount">
                  <span className="label-text">Valor</span>
                </label>
                <input id="amount" name="amount" placeholder="0,00" className="input input-bordered w-full" />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="occurredAt">
                  <span className="label-text">Data</span>
                </label>
                <input id="occurredAt" name="occurredAt" type="date" className="input input-bordered w-full" />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="installmentsTotal">
                  <span className="label-text">Parcelas</span>
                </label>
                <input
                  id="installmentsTotal"
                  name="installmentsTotal"
                  type="number"
                  min={1}
                  max={120}
                  defaultValue={1}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="md:col-span-2">
                <button type="submit" className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </Form>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Compras</h2>

            {props.purchases.length === 0 ? (
              <p className="opacity-70">Nenhuma compra.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th>Data</th>
                      <th>Valor</th>
                      <th>Parcelas</th>
                      <th className="text-right">Antecipar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.purchases.map((p) => (
                      <tr key={p.id}>
                        <td>{p.description}</td>
                        <td>{p.occurredAtIso}</td>
                        <td>{formatBRL(p.amountCents)}</td>
                        <td>
                          {p.installmentsTotal} (início {p.firstInvoiceYm})
                        </td>
                        <td className="text-right">
                          <Form method="post" className="flex items-center justify-end gap-2">
                            <input type="hidden" name="intent" value="prepay" />
                            <input type="hidden" name="purchaseId" value={p.id} />
                            <input type="hidden" name="ym" value={props.invoice.ym} />
                            <input
                              name="installmentsCount"
                              type="number"
                              min={1}
                              max={120}
                              defaultValue={1}
                              className="input input-bordered input-sm w-24"
                            />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Antecipar
                            </button>
                          </Form>
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
