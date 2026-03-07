import { Form } from "react-router";

export function SetupPage(props: { error?: string }) {
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
                aria-invalid={props.error ? "true" : undefined}
                aria-describedby={props.error ? "setup-error" : undefined}
                className="input input-bordered w-full"
              />
            </div>

            {props.error ? (
              <div id="setup-error" role="alert" className="alert alert-error">
                <span>{props.error}</span>
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
