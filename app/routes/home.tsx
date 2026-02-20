import type { Route } from "./+types/home";
import { Form, Link, redirect } from "react-router";

import { getUser } from "~/auth/session.server";
import { countUsers } from "~/auth/user.server";

export function meta() {
  return [
    { title: "Financeiro" },
    { name: "description", content: "Rateio mensal de despesas" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const anyUser = await countUsers();
  if (anyUser === 0) return redirect("/setup");

  const user = await getUser(request);
  if (!user) return redirect("/login");

  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="card bg-base-100 shadow">
        <div className="card-body gap-4">
          <h1 className="card-title">Financeiro</h1>
          <p>Olá, {user.username}.</p>

          <nav className="flex flex-wrap gap-2">
            <Link className="btn btn-outline btn-sm" to="/months">
              Meses
            </Link>
            <Link className="btn btn-outline btn-sm" to="/invite">
              Convite
            </Link>
            <Link className="btn btn-outline btn-sm" to="/admin/users">
              Admin: usuários
            </Link>
          </nav>

          <div className="card-actions justify-end">
            <Form method="post" action="/logout">
              <button type="submit" className="btn btn-ghost">
                Sair
              </button>
            </Form>
          </div>

          <p className="text-sm opacity-70">Próximo: telas de meses, rendas e despesas.</p>
        </div>
      </div>
    </main>
  );
}
