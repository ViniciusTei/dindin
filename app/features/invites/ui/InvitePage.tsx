import { Form, Link } from "react-router";

export function InvitePage(props: {
  origin: string;
  token?: string;
  expiresAt?: string;
}) {
  const link = props.token ? `${props.origin}/join/${props.token}` : null;

  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Convite</h1>
        <Link className="btn btn-ghost btn-sm" to="/">
          Voltar
        </Link>
      </div>

      <div className="mt-6 card bg-base-100 shadow">
        <div className="card-body gap-4">
          <p>Gera um link para a outra pessoa entrar no household.</p>

          <Form method="post">
            <button type="submit" className="btn btn-primary">
              Gerar link (24h)
            </button>
          </Form>

          {link && props.expiresAt ? (
            <section className="space-y-2">
              <p className="text-sm">
                Expira em: <span className="font-mono">{props.expiresAt}</span>
              </p>
              <div className="alert alert-info">
                <span>
                  Link:{" "}
                  <a className="link" href={link}>
                    {link}
                  </a>
                </span>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
