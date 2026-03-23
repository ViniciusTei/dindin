import { Form } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import type { Transaction } from "~/domain/transactions/entity";
import { formatBRL } from "~/lib/money";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";

function centsToInput(cents: number): string {
  const abs = Math.abs(cents);
  return (abs / 100).toFixed(2).replace(".", ",");
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type TransactionFormValues = {
  occurredAt: string;
  type: Transaction["type"];
  accountId: string;
  categoryId: string;
  amount: string;
  description: string;
};

function TransactionFormFields(props: {
  accounts: Account[];
  categories: Category[];
  values: TransactionFormValues;
  idPrefix: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-occurredAt`}>
          <span className="label-text">Data</span>
        </label>
        <input
          id={`${props.idPrefix}-occurredAt`}
          name="occurredAt"
          type="date"
          defaultValue={props.values.occurredAt}
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-type`}>
          <span className="label-text">Tipo</span>
        </label>
        <select
          id={`${props.idPrefix}-type`}
          name="type"
          className="select select-bordered w-full"
          defaultValue={props.values.type}
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </div>

      <div className="form-control md:col-span-6">
        <label className="label" htmlFor={`${props.idPrefix}-accountId`}>
          <span className="label-text">Conta</span>
        </label>
        <select
          id={`${props.idPrefix}-accountId`}
          name="accountId"
          className="select select-bordered w-full"
          defaultValue={props.values.accountId}
        >
          <option value="">Selecione…</option>
          {props.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control md:col-span-6">
        <label className="label" htmlFor={`${props.idPrefix}-categoryId`}>
          <span className="label-text">Categoria</span>
        </label>
        <select
          id={`${props.idPrefix}-categoryId`}
          name="categoryId"
          className="select select-bordered w-full"
          defaultValue={props.values.categoryId}
        >
          <option value="">Sem categoria</option>
          {props.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-amount`}>
          <span className="label-text">Valor</span>
        </label>
        <input
          id={`${props.idPrefix}-amount`}
          name="amount"
          defaultValue={props.values.amount}
          placeholder="0,00"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control md:col-span-12">
        <label className="label" htmlFor={`${props.idPrefix}-description`}>
          <span className="label-text">Descrição</span>
        </label>
        <input
          id={`${props.idPrefix}-description`}
          name="description"
          defaultValue={props.values.description}
          placeholder="Ex.: Mercado, Salário, Uber"
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}

function TransactionCreateModal(props: {
  accounts: Account[];
  categories: Category[];
  error?: string;
  today: string;
}) {
  return (
    <FormModal
      dialogId="create_transaction_modal"
      triggerLabel="Criar transação"
      title="Criar transação"
      description="Registre uma receita ou despesa vinculada à household atual."
      triggerClassName="btn btn-primary"
      triggerTestId="transaction-create-open"
      dialogClassName="max-w-4xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="create" />
        <TransactionFormFields
          accounts={props.accounts}
          categories={props.categories}
          idPrefix="transaction-create"
          values={{
            occurredAt: props.today,
            type: "expense",
            accountId: "",
            categoryId: "",
            amount: "",
            description: "",
          }}
        />

        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="transaction-create-submit"
          >
            Criar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function TransactionEditModal(props: {
  accounts: Account[];
  categories: Category[];
  transaction: Transaction;
}) {
  return (
    <FormModal
      dialogId={`edit_transaction_modal_${props.transaction.id}`}
      triggerLabel="Editar"
      title="Editar transação"
      description={`Atualize os dados de "${props.transaction.description}".`}
      triggerClassName="btn btn-ghost btn-sm"
      dialogClassName="max-w-4xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="update" />
        <input
          type="hidden"
          name="transactionId"
          value={props.transaction.id}
        />
        <TransactionFormFields
          accounts={props.accounts}
          categories={props.categories}
          idPrefix={`transaction-edit-${props.transaction.id}`}
          values={{
            occurredAt: toDateInputValue(props.transaction.occurredAt),
            type: props.transaction.type,
            accountId: props.transaction.accountId,
            categoryId: props.transaction.categoryId ?? "",
            amount: centsToInput(props.transaction.amountCents),
            description: props.transaction.description,
          }}
        />
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

function TransactionDeleteModal(props: { transaction: Transaction }) {
  return (
    <FormModal
      dialogId={`delete_transaction_modal_${props.transaction.id}`}
      triggerLabel="Excluir"
      title="Excluir transação"
      description={`Tem certeza que deseja excluir "${props.transaction.description}"?`}
      triggerClassName="btn btn-ghost btn-sm text-error"
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="delete" />
        <input
          type="hidden"
          name="transactionId"
          value={props.transaction.id}
        />
        <p className="text-sm opacity-70">
          A remoção ajusta o saldo da conta vinculada.
        </p>
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-error">
            Excluir transação
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

export function TransactionsPage(props: {
  accounts: Account[];
  categories: Category[];
  transactions: Array<Transaction & { accountName?: string }>;
  error?: string;
  ok?: boolean;
  today: string;
}) {
  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <TransactionCreateModal
          accounts={props.accounts}
          categories={props.categories}
          error={props.error}
          today={props.today}
        />
      </div>

      <div className="mt-6 grid gap-6">
        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        {props.ok ? (
          <div role="status" className="alert alert-success">
            <span>Salvo.</span>
          </div>
        ) : null}

        <section className="bg-base-100">
          <div className="space-y-4">
            {props.transactions.length === 0 ? (
              <p className="opacity-70">Nenhuma transação.</p>
            ) : (
              <div className="space-y-3">
                {props.transactions.map((t) => {
                  const displayCents =
                    t.type === "expense" ? -t.amountCents : t.amountCents;
                  const categoryName = props.categories.find(
                    (category) => category.id === t.categoryId,
                  )?.name;

                  return (
                    <article
                      key={t.id}
                      className="rounded-box border border-base-300 p-4"
                      data-testid={`transaction-card-${t.id}`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{t.description}</h3>
                            <span
                              className={`badge ${t.type === "expense" ? "badge-error badge-outline" : "badge-success badge-outline"}`}
                            >
                              {t.type === "expense" ? "Despesa" : "Receita"}
                            </span>
                          </div>
                          <div className="grid gap-1 text-sm opacity-70 md:grid-cols-2">
                            <div>Data: {toDateInputValue(t.occurredAt)}</div>
                            <div>Conta: {t.accountName ?? "—"}</div>
                            <div>
                              Categoria: {categoryName ?? "Sem categoria"}
                            </div>
                            <div>Valor: {formatBRL(displayCents)}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 md:justify-end">
                          <TransactionEditModal
                            accounts={props.accounts}
                            categories={props.categories}
                            transaction={t}
                          />
                          <TransactionDeleteModal transaction={t} />
                        </div>
                      </div>
                    </article>
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
