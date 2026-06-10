import { Form, Link } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import { formatBRL } from "~/lib/money";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";

export type CreditCardListItem = {
  id: string;
  nickname: string;
  brand: string;
  last4: string;
  limitCents: number | null;
  closingDay: number | null;
  dueDay: number | null;
  accountId: string | null;
};

function CreditCardCreateModal(props: { accounts: Account[]; error?: string }) {
  return (
    <FormModal
      dialogId="create_credit_card_modal"
      triggerLabel="Cadastrar cartão"
      title="Cadastrar cartão"
      description="Adicione um novo cartão pessoal para acompanhar faturas e compras parceladas."
      triggerClassName="btn btn-primary"
      dialogClassName="max-w-3xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="create" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="form-control md:col-span-2">
            <label className="label" htmlFor="card-create-nickname">
              <span className="label-text">Apelido</span>
            </label>
            <input
              id="card-create-nickname"
              name="nickname"
              placeholder="Ex.: Cartão do Nubank"
              className="input input-bordered w-full"
              aria-invalid={props.error ? "true" : undefined}
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-create-number">
              <span className="label-text">Número (opcional)</span>
            </label>
            <input
              id="card-create-number"
              name="number"
              placeholder="Ex.: 4111 1111 1111 1111"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-create-expiration">
              <span className="label-text">Validade (opcional)</span>
            </label>
            <input
              id="card-create-expiration"
              name="expiration"
              placeholder="03/26"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-create-cvv">
              <span className="label-text">CVV (opcional)</span>
            </label>
            <input
              id="card-create-cvv"
              name="cvv"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-create-limit">
              <span className="label-text">Limite (opcional)</span>
            </label>
            <input
              id="card-create-limit"
              name="limit"
              placeholder="0,00"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-create-closing-day">
              <span className="label-text">Dia de fechamento (opcional)</span>
            </label>
            <input
              id="card-create-closing-day"
              name="closingDay"
              type="number"
              min={1}
              max={31}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="card-create-due-day">
              <span className="label-text">Dia de vencimento (opcional)</span>
            </label>
            <input
              id="card-create-due-day"
              name="dueDay"
              type="number"
              min={1}
              max={31}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control md:col-span-2">
            <label className="label" htmlFor="card-create-account-id">
              <span className="label-text">
                Conta para pagamento (opcional)
              </span>
            </label>
            <select
              id="card-create-account-id"
              name="accountId"
              className="select select-bordered w-full"
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

        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Cadastrar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

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
        <CreditCardCreateModal accounts={props.accounts} error={props.error} />
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

        <section className="bg-base-100">
          <div className="space-y-4">
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
                          {c.nickname}
                          {c.brand ? (
                            <span className="opacity-70">
                              {" "}
                              — {c.brand}
                              {c.last4 !== "????" ? ` •••• ${c.last4}` : ""}
                            </span>
                          ) : null}
                        </td>
                        <td>{c.closingDay ? `Dia ${c.closingDay}` : "—"}</td>
                        <td>{c.dueDay ? `Dia ${c.dueDay}` : "—"}</td>
                        <td>{c.limitCents ? formatBRL(c.limitCents) : "—"}</td>
                        <td className="text-right">
                          <Link
                            to={`/card/${c.id}`}
                            className="btn btn-ghost btn-sm"
                          >
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
