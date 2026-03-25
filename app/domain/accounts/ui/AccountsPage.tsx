import { Form } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import { formatBRL } from "~/lib/money";
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

function AccountRenameModal(props: { account: Account }) {
  return (
    <FormModal
      dialogId={`rename_account_modal_${props.account.id}`}
      triggerLabel="Renomear"
      title="Renomear conta"
      description={`Atualize o nome exibido para a conta "${props.account.name}".`}
      triggerClassName="btn btn-ghost btn-sm"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="rename" />
        <input type="hidden" name="accountId" value={props.account.id} />

        <div className="form-control">
          <label
            className="label"
            htmlFor={`account-rename-name-${props.account.id}`}
          >
            <span className="label-text">Nome</span>
          </label>
          <input
            id={`account-rename-name-${props.account.id}`}
            name="name"
            defaultValue={props.account.name}
            className="input input-bordered w-full"
          />
        </div>

        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid={`account-rename-button-${props.account.id}`}
          >
            Salvar nome
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
      triggerLabel="Excluir"
      title="Excluir conta"
      description={`Tem certeza que deseja excluir a conta "${props.account.name}"?`}
      triggerClassName="btn btn-ghost btn-sm text-error"
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
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Contas</h1>
        <AccountCreateModal error={props.error} />
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

        <section className="bg-base-100 ">
          <div className="space-y-4">
            {props.accounts.length === 0 ? (
              <p className="opacity-70">Nenhuma conta.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Saldo inicial</th>
                      <th>Saldo atual</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.accounts.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <span data-testid={`account-name-${a.name}`}>
                            {a.name}
                          </span>
                        </td>
                        <td>{formatBRL(a.initialBalanceCents)}</td>
                        <td>{formatBRL(a.currentBalanceCents)}</td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <AccountRenameModal account={a} />
                            <AccountDeleteModal account={a} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-base-300 pt-3">
              <div className="text-sm opacity-70">Total (saldo atual)</div>
              <div className="font-semibold">
                {formatBRL(props.totalCurrentBalanceCents)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
