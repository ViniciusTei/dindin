import type { Route } from "./+types/transactions";
import crypto from "node:crypto";

import { requireUserId } from "~/auth/session.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { transactionsRepo } from "~/db/repositories/transactions.repo.server";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { createTransaction } from "~/domain/transactions/usecases/create-transaction";
import { deleteTransaction } from "~/domain/transactions/usecases/delete-transaction";
import { listTransactions } from "~/domain/transactions/usecases/list-transactions";
import { updateTransaction } from "~/domain/transactions/usecases/update-transaction";
import { TransactionsPage } from "~/features/transactions/ui/TransactionsPage";
import { toCents } from "~/lib/money";

function createId(): string {
  return crypto.randomUUID();
}

function parseDateInput(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  // Espera YYYY-MM-DD
  const d = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const [accounts, transactions] = await Promise.all([
    listAccounts({ accountsRepo, userId }),
    listTransactions({ transactionsRepo, userId }),
  ]);

  const accountNameById = new Map(accounts.map((a) => [a.id, a.name] as const));
  const txWithNames = transactions.map((t) => ({ ...t, accountName: accountNameById.get(t.accountId) }));

  return { accounts, transactions: txWithNames, today: todayISODate() };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const accountId = String(form.get("accountId") ?? "");
    const type = String(form.get("type") ?? "");
    const description = String(form.get("description") ?? "");
    const amountCents = toCents(form.get("amount"));
    const occurredAt = parseDateInput(form.get("occurredAt"));

    const result = await createTransaction({
      transactionsRepo,
      idFactory: createId,
      userId,
      accountId,
      type: type as any,
      description,
      amountCents: amountCents ?? NaN,
      occurredAt: occurredAt ?? new Date("invalid"),
    });

    if (!result.ok) {
      switch (result.error) {
        case "ACCOUNT_REQUIRED":
          return { error: "Conta é obrigatória." };
        case "TYPE_INVALID":
          return { error: "Tipo inválido." };
        case "DESCRIPTION_REQUIRED":
          return { error: "Descrição é obrigatória." };
        case "AMOUNT_INVALID":
          return { error: "Valor inválido." };
        case "DATE_REQUIRED":
          return { error: "Data é obrigatória." };
        case "ACCOUNT_NOT_FOUND":
          return { error: "Conta não encontrada." };
      }
    }

    return { ok: true };
  }

  if (intent === "update") {
    const transactionId = String(form.get("transactionId") ?? "");
    const accountId = String(form.get("accountId") ?? "");
    const type = String(form.get("type") ?? "");
    const description = String(form.get("description") ?? "");
    const amountCents = toCents(form.get("amount"));
    const occurredAt = parseDateInput(form.get("occurredAt"));

    const result = await updateTransaction({
      transactionsRepo,
      userId,
      transactionId,
      accountId,
      type: type as any,
      description,
      amountCents: amountCents ?? NaN,
      occurredAt: occurredAt ?? new Date("invalid"),
    });

    if (!result.ok) {
      switch (result.error) {
        case "NOT_FOUND":
          return { error: "Transação não encontrada." };
        case "ACCOUNT_REQUIRED":
          return { error: "Conta é obrigatória." };
        case "TYPE_INVALID":
          return { error: "Tipo inválido." };
        case "DESCRIPTION_REQUIRED":
          return { error: "Descrição é obrigatória." };
        case "AMOUNT_INVALID":
          return { error: "Valor inválido." };
        case "DATE_REQUIRED":
          return { error: "Data é obrigatória." };
        case "ACCOUNT_NOT_FOUND":
          return { error: "Conta não encontrada." };
      }
    }

    return { ok: true };
  }

  if (intent === "delete") {
    const transactionId = String(form.get("transactionId") ?? "");

    const result = await deleteTransaction({ transactionsRepo, userId, transactionId });

    if (!result.ok) {
      switch (result.error) {
        case "NOT_FOUND":
          return { error: "Transação não encontrada." };
      }
    }

    return { ok: true };
  }

  return { error: "Ação inválida" };
}

export default function Transactions({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <TransactionsPage
      accounts={loaderData.accounts}
      transactions={loaderData.transactions}
      today={loaderData.today}
      error={actionData?.error}
      ok={actionData?.ok}
    />
  );
}
