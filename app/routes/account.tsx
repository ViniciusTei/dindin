import type { Route } from "./+types/account";

import { Link } from "react-router";

import { requireUser } from "~/auth/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user: { username: user.username } };
}

export default function Account({ loaderData }: Route.ComponentProps) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Conta</h1>
      <p className="mt-1 text-sm opacity-60">{loaderData.user.username}</p>

      <div className="mt-6 max-w-xl flex flex-col gap-3">
        <Link to="/account/change-password" className="btn btn-outline w-full justify-start">
          Alterar senha
        </Link>

        <Link to="/account/delete" className="btn btn-error btn-outline w-full justify-start">
          Excluir conta
        </Link>
      </div>
    </div>
  );
}
