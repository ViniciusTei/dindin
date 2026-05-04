import { useState } from "react";
import { Form, useNavigation } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import { amountColorClass, formatBRL } from "~/lib/money";
import Icon from "~/ui/Icon";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";

function AccountCreateModal(props: { error?: string }) {
  return (
    <FormModal
      dialogId="create_account_modal"
      triggerLabel="Criar conta"
      title="Criar conta"
      description="Cadastre uma nova conta pessoal para acompanhar seus saldos e transações."
      triggerClassName="btn btn-primary"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="create" />

        <div className="form-control">
          <label className="label" htmlFor="account-create-name">
            <span className="label-text">Nome</span>
          </label>
          <input
            id="account-create-name"
            data-testid="account-name-input"
            name="name"
            placeholder="Ex.: Banco, Carteira, Nubank"
            className="input input-bordered w-full"
            aria-invalid={props.error ? "true" : undefined}
            aria-describedby={props.error ? "accounts-error" : undefined}
          />
        </div>

        <div className="form-control">
          <label className="label" htmlFor="account-create-initial-balance">
            <span className="label-text">Saldo inicial</span>
          </label>
          <input
            id="account-create-initial-balance"
            data-testid="account-initialBalance-input"
            name="initialBalance"
            placeholder="0,00"
            className="input input-bordered w-full"
          />
        </div>

        {props.error ? (
          <div id="accounts-error" role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="account-create-button"
          >
            Criar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function AccountDeleteModal(props: { account: Account }) {
  return (
    <FormModal
      dialogId={`delete_account_modal_${props.account.id}`}
      triggerLabel="Excluir conta"
      triggerContent={<Icon name="trash" className="h-4 w-4" />}
      triggerClassName="btn btn-ghost btn-sm btn-square text-error"
      title="Excluir conta"
      description={`Tem certeza que deseja excluir a conta "${props.account.name}"?`}
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="accountId" value={props.account.id} />
        <p className="text-sm opacity-70">
          Essa ação remove a conta da lista atual.
        </p>
        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-error"
            data-testid={`account-delete-button-${props.account.id}`}
          >
            Excluir conta
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

export function AccountsPage(props: {
  accounts: Array<Account & { currentBalanceCents: number }>;
  totalCurrentBalanceCents: number;
  error?: string;
  ok?: boolean;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="p-4 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Contas</h1>
        <AccountCreateModal error={props.error} />
      </div>

      {props.error ? (
        <div role="alert" className="alert alert-error mb-4">
          <span>{props.error}</span>
        </div>
      ) : null}

      {props.ok ? (
        <div role="status" className="alert alert-success mb-4">
          <span>Salvo.</span>
        </div>
      ) : null}

      {props.accounts.length === 0 ? (
        <p className="opacity-70">Nenhuma conta.</p>
      ) : (
        <div className="card bg-base-100 rounded-box shadow">
          <div className="card-body p-0">
            <ul className="divide-y divide-base-200">
              {props.accounts.map((account) => (
                <li key={account.id} className="flex items-center gap-3 p-3">
                  {editingId === account.id ? (
                    <Form
                      method="post"
                      className="flex flex-1 items-center gap-2"
                      onSubmit={() => setEditingId(null)}
                    >
                      <input type="hidden" name="intent" value="rename" />
                      <input type="hidden" name="accountId" value={account.id} />
                      <input
                        type="text"
                        name="name"
                        defaultValue={account.name}
                        className="input input-sm input-bordered flex-1"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="btn btn-sm btn-primary"
                        disabled={isSubmitting}
                        data-testid={`account-rename-button-${account.id}`}
                      >
                        {isSubmitting ? (
                          <span className="loading loading-spinner loading-xs" />
                        ) : null}
                        Salvar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </Form>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium truncate"
                          data-testid={`account-name-${account.name}`}
                        >
                          {account.name}
                        </div>
                        <div className={`text-sm ${amountColorClass(account.currentBalanceCents)}`}>
                          {formatBRL(account.currentBalanceCents)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Renomear conta"
                        onClick={() => setEditingId(account.id)}
                      >
                        <Icon name="pencil" className="h-4 w-4" />
                      </button>
                      <AccountDeleteModal account={account} />
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between border-t border-base-300 px-3 py-2">
            <div className="text-sm opacity-70">Total (saldo atual)</div>
            <div className={`font-semibold ${amountColorClass(props.totalCurrentBalanceCents)}`}>
              {formatBRL(props.totalCurrentBalanceCents)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
