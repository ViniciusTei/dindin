import { Form, Link } from "react-router";

import type { HouseholdDetails } from "~/domain/households/entity";
import { formatBRL } from "~/lib/money";

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

function formatShareInput(shareBps: number | null): string {
  if (shareBps == null) return "";
  return (shareBps / 100).toFixed(2);
}

export function HouseholdManagePage(props: {
  origin: string;
  household: HouseholdDetails;
  error?: string;
  message?: string;
  inviteToken?: string;
  inviteExpiresAt?: string;
}) {
  const inviteLink = props.inviteToken ? `${props.origin}/join/${props.inviteToken}` : null;

  return (
    <main className="mx-auto mt-10 max-w-6xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciar {props.household.name}</h1>
          <p className="text-sm opacity-70">Membros, permissões, convites e rateio financeiro.</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-ghost btn-sm" to={`/households/${props.household.householdId}`}>
            Ver detalhes
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/households">
            Voltar
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Membros</div>
            <div className="text-2xl font-semibold">{props.household.memberCount}</div>
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Despesas do mês</div>
            <div className="text-2xl font-semibold">{formatBRL(-props.household.currentMonthExpenseCents)}</div>
          </div>
        </section>
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Seu rateio</div>
            <div className="text-2xl font-semibold">{formatShareBps(props.household.currentUserEffectiveShareBps)}</div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="grid gap-6">
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title">Dados básicos</h2>
              <Form method="post" className="space-y-3">
                <input type="hidden" name="intent" value="rename" />
                <div className="form-control">
                  <label className="label" htmlFor="name">
                    <span className="label-text">Nome</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    defaultValue={props.household.name}
                    className="input input-bordered w-full"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Salvar nome
                </button>
              </Form>
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title">Adicionar membro</h2>
              <Form method="post" className="space-y-3">
                <input type="hidden" name="intent" value="add-member" />
                <div className="form-control">
                  <label className="label" htmlFor="username">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    placeholder="Usuário já cadastrado"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="role">
                    <span className="label-text">Papel</span>
                  </label>
                  <select id="role" name="role" className="select select-bordered w-full" defaultValue="member">
                    <option value="member">Membro</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Adicionar por username
                </button>
              </Form>
            </div>
          </section>

          <section className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title">Convite por link</h2>
              <p className="text-sm opacity-70">Use para convidar alguém a entrar nessa household.</p>
              <Form method="post">
                <input type="hidden" name="intent" value="create-invite-link" />
                <button type="submit" className="btn btn-primary w-full">
                  Gerar link (24h)
                </button>
              </Form>
              {inviteLink && props.inviteExpiresAt ? (
                <div className="space-y-2 text-sm">
                  <div className="alert alert-info">
                    <span>
                      Link: <a className="link" href={inviteLink}>{inviteLink}</a>
                    </span>
                  </div>
                  <p>
                    Expira em: <span className="font-mono">{props.inviteExpiresAt}</span>
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          {props.error ? (
            <div role="alert" className="alert alert-error">
              <span>{props.error}</span>
            </div>
          ) : null}

          {props.message ? (
            <div role="status" className="alert alert-success">
              <span>{props.message}</span>
            </div>
          ) : null}

          <section className="card bg-base-100 shadow">
            <div className="card-body gap-4">
              <h2 className="card-title">Permissões dos membros</h2>

              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Papel</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.household.members.map((member) => (
                      <tr key={member.userId}>
                        <td>
                          <div className="font-medium">{member.username}</div>
                          <div className="text-xs opacity-70">
                            {member.role === "admin" ? "Administrador" : "Membro"}
                          </div>
                        </td>
                        <td>
                          <Form method="post" className="flex items-center gap-2">
                            <input type="hidden" name="intent" value="update-role" />
                            <input type="hidden" name="memberUserId" value={member.userId} />
                            <select
                              name="role"
                              defaultValue={member.role}
                              className="select select-bordered select-sm"
                            >
                              <option value="member">Membro</option>
                              <option value="admin">Administrador</option>
                            </select>
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Salvar papel
                            </button>
                          </Form>
                        </td>
                        <td className="text-right">
                          <Form
                            method="post"
                            onSubmit={(event) => {
                              if (!window.confirm(`Remover "${member.username}" desta household?`)) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="intent" value="remove-member" />
                            <input type="hidden" name="memberUserId" value={member.userId} />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Remover
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
              <h2 className="card-title">Rateio de pagamentos</h2>
              <p className="text-sm opacity-70">
                Deixe em branco para dividir automaticamente o restante entre os membros sem percentual explícito.
              </p>

              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value="save-shares" />

                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Papel</th>
                        <th>Percentual explícito</th>
                        <th>Percentual efetivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.household.members.map((member) => (
                        <tr key={member.userId}>
                          <td>{member.username}</td>
                          <td>{member.role === "admin" ? "Administrador" : "Membro"}</td>
                          <td>
                            <label className="input input-bordered flex items-center gap-2">
                              <input
                                name={`share:${member.userId}`}
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                defaultValue={formatShareInput(member.explicitShareBps)}
                                className="grow"
                              />
                              <span className="text-xs opacity-70">%</span>
                            </label>
                          </td>
                          <td className="font-medium">{formatShareBps(member.effectiveShareBps)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button type="submit" className="btn btn-primary">
                  Salvar rateio
                </button>
              </Form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
