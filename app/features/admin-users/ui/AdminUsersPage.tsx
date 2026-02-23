import { Form } from "react-router";

import type { UserSummary } from "~/domain/users/entity";

export function AdminUsersPage(props: {
  users: UserSummary[];
  error?: string;
  ok?: boolean;
}) {
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <h1 className="text-2xl font-semibold">Usuários</h1>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Criar usuário</h2>

            <Form method="post" className="space-y-3">
              <div className="form-control">
                <label className="label" htmlFor="username">
                  <span className="label-text">Usuário</span>
                </label>
                <input
                  id="username"
                  name="username"
                  autoComplete="off"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Senha</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="input input-bordered w-full"
                />
              </div>

              <label className="label cursor-pointer justify-start gap-3">
                <input name="isAdmin" type="checkbox" className="checkbox" />
                <span className="label-text">Admin</span>
              </label>

              {props.error ? (
                <div role="alert" className="alert alert-error">
                  <span>{props.error}</span>
                </div>
              ) : null}
              {props.ok ? (
                <div role="status" className="alert alert-success">
                  <span>Usuário criado</span>
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
            {props.users.length === 0 ? (
              <p className="opacity-70">Nenhum usuário.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Perfil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>
                          {u.isAdmin ? (
                            <span className="badge badge-primary badge-outline">admin</span>
                          ) : (
                            <span className="badge badge-outline">membro</span>
                          )}
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
