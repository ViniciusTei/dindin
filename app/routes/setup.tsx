import type { Route } from "./+types/setup";
import { Form, redirect } from "react-router";

import { createHouseholdWithAdmin } from "~/auth/household.server";
import { createUserSession } from "~/auth/session.server";
import { countUsers, createLocalUser } from "~/auth/user.server";

export async function loader() {
  const anyUser = await countUsers();
  if (anyUser > 0) return redirect("/login");
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const anyUser = await countUsers();
  if (anyUser > 0) return new Response("Setup já realizado", { status: 403 });

  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!username || password.length < 8) {
    return { error: "Informe usuário e senha (mín. 8)." };
  }

  const created = await createLocalUser({ username, password, isAdmin: true });
  if (!created) return { error: "Usuário já existe." };

  await createHouseholdWithAdmin({ adminUserId: created.id, name: "Casa" });

  return createUserSession({ userId: created.id, redirectTo: "/" });
}

export default function Setup({ actionData }: Route.ComponentProps) {
  return (
    <main className="mx-auto mt-10 max-w-md px-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4">
          <h1 className="card-title">Setup inicial</h1>
          <p className="opacity-80">Criar o primeiro usuário admin.</p>

          <Form method="post" className="space-y-3">
            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text">Usuário</span>
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
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
                aria-invalid={actionData?.error ? true : undefined}
                aria-describedby={actionData?.error ? "setup-error" : undefined}
                className="input input-bordered w-full"
              />
            </div>

            {actionData?.error ? (
              <div id="setup-error" role="alert" className="alert alert-error">
                <span>{actionData.error}</span>
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary w-full">
              Criar admin
            </button>
          </Form>
        </div>
      </div>
    </main>
  );
}
