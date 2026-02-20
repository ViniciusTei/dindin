import type { Route } from "./+types/login";
import { Form, redirect } from "react-router";

import { createUserSession, getUserId } from "~/auth/session.server";
import { verifyLogin } from "~/auth/user.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");

  const user = await verifyLogin({ username, password });
  if (!user) return { error: "Login inválido" };

  return createUserSession({ userId: user.id, redirectTo: "/" });
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <main className="mx-auto mt-10 max-w-md px-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4">
          <h1 className="card-title">Entrar</h1>

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
                autoComplete="current-password"
                aria-invalid={actionData?.error ? true : undefined}
                aria-describedby={actionData?.error ? "login-error" : undefined}
                className="input input-bordered w-full"
              />
            </div>

            {actionData?.error ? (
              <div id="login-error" role="alert" className="alert alert-error">
                <span>{actionData.error}</span>
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary w-full">
              Entrar
            </button>
          </Form>

          <p className="text-sm opacity-80">
            Se for a primeira vez, acesse{" "}
            <a className="link link-primary" href="/setup">
              /setup
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
