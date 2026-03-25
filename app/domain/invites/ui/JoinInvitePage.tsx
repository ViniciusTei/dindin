import { Form, Link } from "react-router";

export function JoinInvitePage(props: { error?: string }) {
  return (
    <main className="mx-auto mt-10 max-w-md px-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4">
          <h1 className="card-title">Entrar por convite</h1>

          <p className="text-sm opacity-80">
            Este convite cria sua conta e já vincula você à household.
          </p>

          <Form method="post" className="space-y-3">
            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text">Usuário</span>
              </label>
              <input id="username" name="username" autoComplete="username" className="input input-bordered w-full" />
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

            {props.error ? (
              <div role="alert" className="alert alert-error">
                <span>{props.error}</span>
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary w-full">
              Criar conta e entrar
            </button>
          </Form>

          <p className="text-sm opacity-80">
            Já tem conta?{" "}
            <Link className="link link-primary" to="/login">
              Faça login e abra o convite novamente
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
