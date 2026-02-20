import type { Route } from "./+types/admin.users";
import { Form } from "react-router";

import { requireAdmin } from "~/auth/session.server";
import { createLocalUser } from "~/auth/user.server";
import { db } from "~/db/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAdmin(request);
  const allUsers = await db.query.users.findMany({
    columns: { id: true, username: true, isAdmin: true, createdAt: true },
    orderBy: (t, { asc }) => asc(t.createdAt),
  });
  return { users: allUsers };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const isAdmin = form.get("isAdmin") === "on";

  if (!username || password.length < 8) {
    return { error: "Informe usuário e senha (mín. 8)." };
  }

  const created = await createLocalUser({ username, password, isAdmin });
  if (!created) return { error: "Usuário já existe." };

  return { ok: true };
}

export default function AdminUsers({ loaderData, actionData }: Route.ComponentProps) {
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

              {actionData?.error ? (
                <div role="alert" className="alert alert-error">
                  <span>{actionData.error}</span>
                </div>
              ) : null}
              {actionData?.ok ? (
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
            {loaderData.users.length === 0 ? (
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
                    {loaderData.users.map((u) => (
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
