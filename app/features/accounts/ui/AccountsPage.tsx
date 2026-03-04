import { Form } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import { formatBRL } from "~/lib/money";

export function AccountsPage(props: {
  accounts: Account[];
  error?: string;
  ok?: boolean;
}) {
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Contas</h1>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Criar conta</h2>

            <Form method="post" className="space-y-3">
              <input type="hidden" name="intent" value="create" />

              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Nome</span>
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Ex.: Banco, Carteira, Nubank"
                  className="input input-bordered w-full"
                  aria-invalid={props.error ? true : undefined}
                  aria-describedby={props.error ? "accounts-error" : undefined}
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="initialBalance">
                  <span className="label-text">Saldo inicial</span>
                </label>
                <input
                  id="initialBalance"
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

              {props.ok ? (
                <div role="status" className="alert alert-success">
                  <span>Salvo.</span>
                </div>
              ) : null}

              <button type="submit" className="btn btn-primary">
                Criar
              </button>
            </Form>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Lista</h2>

            {props.accounts.length === 0 ? (
              <p className="opacity-70">Nenhuma conta.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Saldo inicial</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.accounts.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <Form method="post" className="flex items-center gap-2">
                            <input type="hidden" name="intent" value="rename" />
                            <input type="hidden" name="accountId" value={a.id} />
                            <input
                              name="name"
                              defaultValue={a.name}
                              className="input input-bordered input-sm w-full"
                            />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Renomear
                            </button>
                          </Form>
                        </td>
                        <td>{formatBRL(a.initialBalanceCents)}</td>
                        <td className="text-right">
                          <Form
                            method="post"
                            onSubmit={(e) => {
                              if (!window.confirm(`Excluir a conta "${a.name}"?`)) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="accountId" value={a.id} />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Excluir
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
