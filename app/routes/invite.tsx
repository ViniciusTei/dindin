import type { Route } from "./+types/invite";

import { Form, Link } from "react-router";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { createInviteLink } from "~/auth/invite.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return { origin: url.origin };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const { token, expiresAt } = await createInviteLink({
    householdId,
    createdByUserId: userId,
    ttlHours: 24,
  });

  return { token, expiresAt: expiresAt.toISOString() };
}

export default function Invite({ loaderData, actionData }: Route.ComponentProps) {
  const link = actionData?.token
    ? `${loaderData.origin}/join/${actionData.token}`
    : null;

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

          {link && actionData ? (
            <section className="space-y-2">
              <p className="text-sm">
                Expira em: <span className="font-mono">{actionData.expiresAt}</span>
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
