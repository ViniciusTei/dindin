import { Form, Link } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import { formatBRL } from "~/lib/money";
import FormModal, { ModalCloseButton, closeDialogOnSubmit } from "~/ui/FormModal";

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

function CreditCardSettingsModal(props: {
  accounts: Account[];
  card: CreditCardDetail;
}) {
  return (
    <FormModal
      dialogId={`credit_card_settings_modal_${props.card.id}`}
      triggerLabel="Editar configurações"
      title="Editar configurações"
      description="Ajuste fechamento, vencimento, limite e a conta usada para pagamento da fatura."
      triggerClassName="btn btn-primary"
      dialogClassName="max-w-3xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="update" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="form-control">
            <label className="label" htmlFor="card-settings-closing-day">
              <span className="label-text">Dia de fechamento</span>
            </label>
            <input
              id="card-settings-closing-day"
              name="closingDay"
              type="number"
              min={1}
              max={31}
              defaultValue={props.card.closingDay}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-settings-due-day">
              <span className="label-text">Dia de vencimento</span>
            </label>
            <input
              id="card-settings-due-day"
              name="dueDay"
              type="number"
              min={1}
              max={31}
              defaultValue={props.card.dueDay}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-settings-limit">
              <span className="label-text">Limite (opcional)</span>
            </label>
            <input
              id="card-settings-limit"
              name="limit"
              placeholder="0,00"
              defaultValue={props.card.limitCents ? (props.card.limitCents / 100).toFixed(2).replace(".", ",") : ""}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-settings-account-id">
              <span className="label-text">Conta para pagamento (opcional)</span>
            </label>
            <select
              id="card-settings-account-id"
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
        </div>

        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function CreditCardPurchaseModal(props: { categories: Category[] }) {
  return (
    <FormModal
      dialogId="credit_card_purchase_modal"
      triggerLabel="Adicionar compra"
      title="Adicionar compra"
      description="Registre uma compra no cartão atual, com categoria opcional e parcelamento."
      triggerClassName="btn btn-primary"
      dialogClassName="max-w-3xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="purchase" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="form-control md:col-span-2">
            <label className="label" htmlFor="card-purchase-description">
              <span className="label-text">Descrição</span>
            </label>
            <input id="card-purchase-description" name="description" className="input input-bordered w-full" />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label" htmlFor="card-purchase-category-id">
              <span className="label-text">Categoria</span>
            </label>
            <select id="card-purchase-category-id" name="categoryId" className="select select-bordered w-full">
              <option value="">Sem categoria</option>
              {props.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-purchase-amount">
              <span className="label-text">Valor</span>
            </label>
            <input id="card-purchase-amount" name="amount" placeholder="0,00" className="input input-bordered w-full" />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-purchase-occurred-at">
              <span className="label-text">Data</span>
            </label>
            <input id="card-purchase-occurred-at" name="occurredAt" type="date" className="input input-bordered w-full" />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-purchase-installments-total">
              <span className="label-text">Parcelas</span>
            </label>
            <input
              id="card-purchase-installments-total"
              name="installmentsTotal"
              type="number"
              min={1}
              max={120}
              defaultValue={1}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Adicionar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function CreditCardPrepayModal(props: {
  purchase: CreditCardPurchaseListItem;
  ym: string;
}) {
  return (
    <FormModal
      dialogId={`credit_card_prepay_modal_${props.purchase.id}`}
      triggerLabel="Antecipar"
      title="Antecipar parcelas"
      description={`Antecipe parcelas de \"${props.purchase.description}\" para a fatura ${props.ym}.`}
      triggerClassName="btn btn-ghost btn-sm"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="prepay" />
        <input type="hidden" name="purchaseId" value={props.purchase.id} />
        <input type="hidden" name="ym" value={props.ym} />

        <div className="form-control">
          <label className="label" htmlFor={`credit-card-prepay-installments-${props.purchase.id}`}>
            <span className="label-text">Parcelas a antecipar</span>
          </label>
          <input
            id={`credit-card-prepay-installments-${props.purchase.id}`}
            name="installmentsCount"
            type="number"
            min={1}
            max={120}
            defaultValue={1}
            className="input input-bordered w-full"
          />
        </div>

        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Confirmar antecipação
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

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
  const paymentAccountName = props.accounts.find((account) => account.id === props.card.accountId)?.name;

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

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 text-sm">
              <h2 className="card-title">Configurações</h2>
              <div>Fechamento: dia {props.card.closingDay}</div>
              <div>Vencimento: dia {props.card.dueDay}</div>
              <div>Limite: {props.card.limitCents ? formatBRL(props.card.limitCents) : "—"}</div>
              <div>Conta para pagamento: {paymentAccountName ?? "(sem conta)"}</div>
            </div>
            <CreditCardSettingsModal accounts={props.accounts} card={props.card} />
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="card-title">Compras</h2>
                <p className="text-sm opacity-70">Gerencie compras registradas no cartão e antecipe parcelas quando necessário.</p>
              </div>
              <CreditCardPurchaseModal categories={props.categories} />
            </div>

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
                      <th className="text-right">Ações</th>
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
                        <td>
                          <div className="flex justify-end">
                            <CreditCardPrepayModal purchase={p} ym={props.invoice.ym} />
                          </div>
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
