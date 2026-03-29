import type { Route } from "./+types/account.delete";

import { Form, redirect } from "react-router";

import { requireUser } from "~/auth/session.server";
import { logout } from "~/auth/session.server";
import { usersStatsRepo } from "~/db/repositories/users-stats.repo.server";
import { usersEraseRepo } from "~/db/repositories/users-erase.repo.server";
import { eraseUserData } from "~/domain/users/usecases/erase-user-data";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user: { username: user.username } };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent !== "erase") {
    return { error: "Ação inválida" };
  }

  await eraseUserData({ usersEraseRepo, userId: user.id });

  const anyUser = await usersStatsRepo.hasAnyUsers();
  if (!anyUser) {
    const res = await logout(request);
    return redirect("/setup", { headers: res.headers });
  }

  return logout(request);
}

export default function AccountDelete({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Excluir conta</h1>

      <div className="mt-4 max-w-xl">
        <div className="alert alert-warning">
          <div>
            <div className="font-medium">Excluir conta (LGPD)</div>
            <div className="text-sm opacity-80">
              Isso remove seu usuário e dados vinculados. Se você for o último membro do household, o household e seus dados também serão removidos.
            </div>
          </div>
        </div>

        {actionData?.error ? (
          <div className="alert alert-error mt-4">
            <span>{actionData.error}</span>
          </div>
        ) : null}

        <Form
          method="post"
          className="mt-4"
          onSubmit={async (event) => {
            if (!window.confirm(`Tem certeza que deseja excluir a conta "${loaderData.user.username}"?`)) {
              event.preventDefault();
              return;
            }

            try {
              if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHES" });
              }
            } catch {
              // ignore
            }
          }}
        >
          <input type="hidden" name="intent" value="erase" />
          <button type="submit" className="btn btn-error">
            Excluir minha conta
          </button>
        </Form>
      </div>
    </div>
  );
}
