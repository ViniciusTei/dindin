import { Form } from "react-router";

export function LoginPage(props: { error?: string }) {
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
                aria-invalid={props.error ? true : undefined}
                aria-describedby={props.error ? "login-error" : undefined}
                className="input input-bordered w-full"
              />
            </div>

            {props.error ? (
              <div id="login-error" role="alert" className="alert alert-error">
                <span>{props.error}</span>
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
