import { Form } from "react-router";

type Props = {
  error?: string | null;
  success?: boolean;
  action?: string;
};

export function ChangePasswordForm({ error, success, action }: Props) {
  return (
    <div className="max-w-md">
      {success ? (
        <div role="alert" className="alert alert-success mb-4">
          <span>Senha alterada com sucesso.</span>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      ) : null}

      <Form method="post" action={action} className="flex flex-col gap-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Alterar senha</legend>

          <label className="floating-label">
            <input
              type="password"
              name="currentPassword"
              placeholder="Senha atual"
              className="input w-full"
              required
              autoComplete="current-password"
            />
            <span>Senha atual</span>
          </label>

          <label className="floating-label mt-2">
            <input
              type="password"
              name="newPassword"
              placeholder="Nova senha"
              className="input w-full"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <span>Nova senha</span>
          </label>
          <p className="label">Mínimo de 8 caracteres.</p>
        </fieldset>

        <button type="submit" className="btn btn-primary">
          Salvar nova senha
        </button>
      </Form>
    </div>
  );
}
