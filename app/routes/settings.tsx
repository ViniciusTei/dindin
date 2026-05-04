import type { Route } from "./+types/settings";
import { Form } from "react-router";

import { requireUser } from "~/auth/session.server";
import { ChangePasswordForm } from "~/domain/users/ui/ChangePasswordForm";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const ok = url.searchParams.get("ok") ?? null;
  const rawError = url.searchParams.get("error");
  const error = rawError ? decodeURIComponent(rawError) : null;
  return { user: { username: user.username }, ok, error };
}

export default function Account({ loaderData }: Route.ComponentProps) {
  const { user, ok, error } = loaderData;

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Configurações da conta</h1>

      <p className="text-sm opacity-60 mb-4">{user.username}</p>

      {ok === "change-password" ? (
        <div role="status" className="alert alert-success mb-4">
          <span>Senha alterada com sucesso.</span>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      <div className="join join-vertical w-full flex flex-col gap-0">
        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" name="accordion-settings" defaultChecked={ok === "change-password"} />
          <div className="collapse-title font-medium">Alterar senha</div>
          <div className="collapse-content">
            <ChangePasswordForm action="/settings/change-password" />
          </div>
        </div>

        <div className="collapse collapse-arrow join-item border border-base-300">
          <input type="checkbox" name="accordion-settings" />
          <div className="collapse-title font-medium text-error">Excluir conta</div>
          <div className="collapse-content">
            <div className="alert alert-warning mb-4">
              <div>
                <div className="font-medium">Excluir conta (LGPD)</div>
                <div className="text-sm opacity-80">
                  Isso remove seu usuário e dados vinculados. Se você for o último membro do household, o household e seus dados também serão removidos.
                </div>
              </div>
            </div>
            <Form
              method="post"
              action="/settings/delete"
              onSubmit={async (event) => {
                if (!window.confirm(`Tem certeza que deseja excluir a conta "${user.username}"?`)) {
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
      </div>
    </div>
  );
}
