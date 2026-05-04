import { Form, Link } from "react-router";

import type {
  HouseholdDetails,
  HouseholdMember,
} from "~/domain/households/entity";
import { HouseholdContextBar } from "~/domain/households/ui/HouseholdContextBar";
import { formatBRL } from "~/lib/money";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

function formatShareInput(shareBps: number | null): string {
  if (shareBps == null) return "";
  return (shareBps / 100).toFixed(2);
}

function HouseholdRenameModal(props: { household: HouseholdDetails }) {
  return (
    <FormModal
      dialogId={`rename_household_modal_${props.household.householdId}`}
      triggerLabel="Renomear household"
      title="Atualizar dados básicos"
      description="Edite o nome usado na navegação e nos resumos da household."
      triggerClassName="btn btn-primary btn-sm"
      triggerTestId="household-rename-open"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="rename" />
        <div className="form-control">
          <label className="label" htmlFor="household-manage-name">
            <span className="label-text">Nome</span>
          </label>
          <input
            id="household-manage-name"
            name="name"
            defaultValue={props.household.name}
            className="input input-bordered w-full"
          />
        </div>
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Salvar nome
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function HouseholdAddMemberModal() {
  return (
    <FormModal
      dialogId="household_add_member_modal"
      triggerLabel="Adicionar membro"
      title="Adicionar membro"
      description="Inclua um usuário já cadastrado e defina o papel inicial dentro da household."
      triggerClassName="btn btn-primary btn-sm"
      triggerTestId="household-add-member-open"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="add-member" />
        <div className="form-control">
          <label className="label" htmlFor="household-add-member-username">
            <span className="label-text">Username</span>
          </label>
          <input
            id="household-add-member-username"
            name="username"
            placeholder="Usuário já cadastrado"
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="household-add-member-role">
            <span className="label-text">Papel</span>
          </label>
          <select
            id="household-add-member-role"
            name="role"
            className="select select-bordered w-full"
            defaultValue="member"
          >
            <option value="member">Membro</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="household-add-member-submit"
          >
            Adicionar por username
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function HouseholdInviteModal() {
  return (
    <FormModal
      dialogId="household_invite_modal"
      triggerLabel="Gerar link de convite"
      title="Gerar link de convite"
      description="Crie um link temporário para convidar alguém a entrar nessa household."
      triggerClassName="btn btn-primary btn-sm"
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="create-invite-link" />
        <p className="text-sm opacity-70">
          O convite ficará válido por 24 horas.
        </p>
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Gerar link
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function HouseholdUpdateRoleModal(props: { member: HouseholdMember }) {
  return (
    <FormModal
      dialogId={`household_update_role_modal_${props.member.userId}`}
      triggerLabel="Alterar papel"
      title="Alterar papel do membro"
      description={`Defina o papel de "${props.member.username}" nesta household.`}
      triggerClassName="btn btn-ghost btn-sm"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="update-role" />
        <input type="hidden" name="memberUserId" value={props.member.userId} />
        <div className="form-control">
          <label
            className="label"
            htmlFor={`household-member-role-${props.member.userId}`}
          >
            <span className="label-text">Papel</span>
          </label>
          <select
            id={`household-member-role-${props.member.userId}`}
            name="role"
            defaultValue={props.member.role}
            className="select select-bordered w-full"
          >
            <option value="member">Membro</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Salvar papel
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function HouseholdRemoveMemberModal(props: { member: HouseholdMember }) {
  return (
    <FormModal
      dialogId={`household_remove_member_modal_${props.member.userId}`}
      triggerLabel="Remover"
      title="Remover membro"
      description={`Tem certeza que deseja remover "${props.member.username}" desta household?`}
      triggerClassName="btn btn-ghost btn-sm text-error"
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="remove-member" />
        <input type="hidden" name="memberUserId" value={props.member.userId} />
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-error">
            Remover membro
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function HouseholdSharesModal(props: { household: HouseholdDetails }) {
  return (
    <FormModal
      dialogId={`household_shares_modal_${props.household.householdId}`}
      triggerLabel="Configurar rateio"
      title="Configurar rateio de pagamentos"
      description="Deixe em branco para dividir automaticamente o restante entre os membros sem percentual explícito."
      triggerClassName="btn btn-primary btn-sm"
      triggerTestId="household-shares-open"
      dialogClassName="max-w-5xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="save-shares" />
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Papel</th>
                <th>Percentual explícito</th>
                <th>Percentual efetivo</th>
              </tr>
            </thead>
            <tbody>
              {props.household.members.map((member) => (
                <tr key={member.userId}>
                  <td>{member.username}</td>
                  <td>
                    {member.role === "admin" ? "Administrador" : "Membro"}
                  </td>
                  <td>
                    <label className="input input-bordered flex items-center gap-2">
                      <input
                        name={`share:${member.userId}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        defaultValue={formatShareInput(member.explicitShareBps)}
                        className="grow"
                      />
                      <span className="text-xs opacity-70">%</span>
                    </label>
                  </td>
                  <td className="font-medium">
                    {formatShareBps(member.effectiveShareBps)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="household-shares-submit"
          >
            Salvar rateio
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

export function HouseholdManagePage(props: {
  origin: string;
  household: HouseholdDetails;
  error?: string;
  message?: string;
  inviteToken?: string;
  inviteExpiresAt?: string;
}) {
  const inviteLink = props.inviteToken
    ? `${props.origin}/join/${props.inviteToken}`
    : null;

  return (
    <>
      <HouseholdContextBar household={props.household} />
      <main className="mx-auto mt-10 max-w-6xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Gerenciar {props.household.name}
          </h1>
          <p className="text-sm opacity-70">
            Membros, permissões, convites e rateio financeiro.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="btn btn-ghost btn-sm"
            to={`/households/${props.household.householdId}`}
          >
            Ver detalhes
          </Link>
          <Link className="btn btn-ghost btn-sm" to="/households">
            Voltar
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        {props.message ? (
          <div role="status" className="alert alert-success">
            <span>{props.message}</span>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-2">
              <div className="text-sm opacity-70">Membros</div>
              <div className="text-2xl font-semibold">
                {props.household.memberCount}
              </div>
            </div>
          </section>
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-2">
              <div className="text-sm opacity-70">Despesas do mês</div>
              <div className="text-2xl font-semibold">
                {formatBRL(-props.household.currentMonthExpenseCents)}
              </div>
            </div>
          </section>
          <section className="card bg-base-100 shadow">
            <div className="card-body gap-2">
              <div className="text-sm opacity-70">Seu rateio</div>
              <div className="text-2xl font-semibold">
                {formatShareBps(props.household.currentUserEffectiveShareBps)}
              </div>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="grid gap-6">
            <section className="card bg-base-100 shadow">
              <div className="card-body gap-4">
                <div>
                  <h2 className="card-title">Dados básicos</h2>
                  <p className="text-sm opacity-70">
                    Nome atual: {props.household.name}
                  </p>
                </div>
                <HouseholdRenameModal household={props.household} />
              </div>
            </section>

            <section className="card bg-base-100 shadow">
              <div className="card-body gap-4">
                <div>
                  <h2 className="card-title">Membros</h2>
                  <p className="text-sm opacity-70">
                    Adicione usuários existentes diretamente à household.
                  </p>
                </div>
                <HouseholdAddMemberModal />
              </div>
            </section>

            <section className="card bg-base-100 shadow">
              <div className="card-body gap-4">
                <div>
                  <h2 className="card-title">Convite por link</h2>
                  <p className="text-sm opacity-70">
                    Use para convidar alguém a entrar nessa household.
                  </p>
                </div>
                <HouseholdInviteModal />
                {inviteLink && props.inviteExpiresAt ? (
                  <div className="space-y-2 text-sm">
                    <div className="alert alert-info">
                      <span>
                        Link:{" "}
                        <a className="link" href={inviteLink}>
                          {inviteLink}
                        </a>
                      </span>
                    </div>
                    <p>
                      Expira em:{" "}
                      <span className="font-mono">{props.inviteExpiresAt}</span>
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>

          <div className="grid gap-6">
            <section className="card bg-base-100 shadow">
              <div className="card-body gap-4">
                <h2 className="card-title">Permissões dos membros</h2>

                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Papel</th>
                        <th className="text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.household.members.map((member) => (
                        <tr key={member.userId}>
                          <td>
                            <div className="font-medium">{member.username}</div>
                            <div className="text-xs opacity-70">
                              {member.role === "admin"
                                ? "Administrador"
                                : "Membro"}
                            </div>
                          </td>
                          <td>
                            {member.role === "admin"
                              ? "Administrador"
                              : "Membro"}
                          </td>
                          <td>
                            <div className="flex justify-end gap-2">
                              <HouseholdUpdateRoleModal member={member} />
                              <HouseholdRemoveMemberModal member={member} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="card bg-base-100 shadow">
              <div className="card-body gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="card-title">Rateio de pagamentos</h2>
                    <p className="text-sm opacity-70">
                      Confira o percentual explícito e o efetivo aplicado a cada
                      membro.
                    </p>
                  </div>
                  <HouseholdSharesModal household={props.household} />
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Papel</th>
                        <th>Percentual explícito</th>
                        <th>Percentual efetivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.household.members.map((member) => (
                        <tr key={member.userId}>
                          <td>{member.username}</td>
                          <td>
                            {member.role === "admin"
                              ? "Administrador"
                              : "Membro"}
                          </td>
                          <td>
                            {member.explicitShareBps == null
                              ? "Automático"
                              : formatShareBps(member.explicitShareBps)}
                          </td>
                          <td className="font-medium">
                            {formatShareBps(member.effectiveShareBps)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}
