import type { Route } from "./+types/accounts";
import crypto from "node:crypto";

import { requireUserId } from "~/auth/session.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { createAccount } from "~/domain/accounts/usecases/create-account";
import { deleteAccount } from "~/domain/accounts/usecases/delete-account";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { renameAccount } from "~/domain/accounts/usecases/rename-account";
import { AccountsPage } from "~/features/accounts/ui/AccountsPage";
import { toCents } from "~/lib/money";

function createId(): string {
  return crypto.randomUUID();
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const accounts = await listAccounts({ accountsRepo, userId });
  const sumsById = await accountsRepo.sumSignedTransactionsByAccountIds({
    userId,
    accountIds: accounts.map((a) => a.id),
  });

  const accountsWithBalance = accounts.map((a) => ({
    ...a,
    currentBalanceCents: a.initialBalanceCents + (sumsById[a.id] ?? 0),
  }));

  const totalCurrentBalanceCents = accountsWithBalance.reduce(
    (acc, a) => acc + a.currentBalanceCents,
    0
  );

  return { accounts: accountsWithBalance, totalCurrentBalanceCents };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const name = String(form.get("name") ?? "");
    const initialBalanceCents = toCents(form.get("initialBalance")) ?? 0;

    const result = await createAccount({
      accountsRepo,
      idFactory: createId,
      userId,
      name,
      initialBalanceCents,
    });

    if (!result.ok) {
      switch (result.error) {
        case "NAME_REQUIRED":
          return { error: "Nome é obrigatório." };
        case "INITIAL_BALANCE_INVALID":
          return { error: "Saldo inicial inválido." };
        case "ALREADY_EXISTS":
          return { error: "Já existe uma conta com esse nome." };
      }
    }

    return { ok: true };
  }

  if (intent === "rename") {
    const accountId = String(form.get("accountId") ?? "");
    const name = String(form.get("name") ?? "");

    const result = await renameAccount({ accountsRepo, userId, accountId, name });

    if (!result.ok) {
      switch (result.error) {
        case "NAME_REQUIRED":
          return { error: "Nome é obrigatório." };
        case "NOT_FOUND":
          return { error: "Conta não encontrada." };
        case "ALREADY_EXISTS":
          return { error: "Já existe uma conta com esse nome." };
      }
    }

    return { ok: true };
  }

  if (intent === "delete") {
    const accountId = String(form.get("accountId") ?? "");

    const result = await deleteAccount({ accountsRepo, userId, accountId });

    if (!result.ok) {
      switch (result.error) {
        case "HAS_TRANSACTIONS":
          return { error: "Não é permitido excluir conta com transações vinculadas." };
        case "NOT_FOUND":
          return { error: "Conta não encontrada." };
      }
    }

    return { ok: true };
  }

  return { error: "Ação inválida" };
}

export default function Accounts({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <AccountsPage
      accounts={loaderData.accounts}
      totalCurrentBalanceCents={loaderData.totalCurrentBalanceCents}
      error={actionData?.error}
      ok={actionData?.ok}
    />
  );
}
