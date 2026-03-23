import type { Route } from "./+types/households.$householdId.transactions";
import crypto from "node:crypto";

import { requireHouseholdAccess } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { categoriesRepo } from "~/db/repositories/categories.repo.server";
import { transactionsRepo } from "~/db/repositories/transactions.repo.server";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { listCategories } from "~/domain/categories/usecases/list-categories";
import type { TransactionType } from "~/domain/transactions/entity";
import { createTransaction } from "~/domain/transactions/usecases/create-transaction";
import { deleteTransaction } from "~/domain/transactions/usecases/delete-transaction";
import { listTransactions } from "~/domain/transactions/usecases/list-transactions";
import { updateTransaction } from "~/domain/transactions/usecases/update-transaction";
import { TransactionsPage } from "~/domain/transactions/ui/TransactionsPage";
import { toCents } from "~/lib/money";

function createId(): string {
  return crypto.randomUUID();
}

function parseDateInput(value: FormDataEntryValue | null): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAccess({ userId, householdId });

  const [accounts, categories, transactions] = await Promise.all([
    listAccounts({ accountsRepo, userId }),
    listCategories({ categoriesRepo, householdId }),
    listTransactions({ transactionsRepo, userId, householdId }),
  ]);

  const accountNameById = new Map(accounts.map((account) => [account.id, account.name] as const));

  return {
    accounts,
    categories,
    transactions: transactions.map((transaction) => ({
      ...transaction,
      accountName: accountNameById.get(transaction.accountId),
    })),
    today: todayISODate(),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAccess({ userId, householdId });

  const categories = await listCategories({ categoriesRepo, householdId });
  const validCategoryIds = new Set(categories.map((category) => category.id));

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const accountId = String(form.get("accountId") ?? "");
    const categoryIdRaw = String(form.get("categoryId") ?? "").trim();
    const categoryId = categoryIdRaw ? categoryIdRaw : null;
    const type = String(form.get("type") ?? "");
    const description = String(form.get("description") ?? "");
    const amountCents = toCents(form.get("amount"));
    const occurredAt = parseDateInput(form.get("occurredAt"));

    if (categoryId && !validCategoryIds.has(categoryId)) {
      return { error: "Categoria não encontrada." };
    }

    const result = await createTransaction({
      transactionsRepo,
      idFactory: createId,
      userId,
      householdId,
      accountId,
      categoryId,
      type: type as TransactionType,
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
        case "CATEGORY_NOT_FOUND":
          return { error: "Categoria não encontrada." };
      }
    }

    return { ok: true };
  }

  if (intent === "update") {
    const transactionId = String(form.get("transactionId") ?? "");
    const accountId = String(form.get("accountId") ?? "");
    const categoryIdRaw = String(form.get("categoryId") ?? "").trim();
    const categoryId = categoryIdRaw ? categoryIdRaw : null;
    const type = String(form.get("type") ?? "");
    const description = String(form.get("description") ?? "");
    const amountCents = toCents(form.get("amount"));
    const occurredAt = parseDateInput(form.get("occurredAt"));

    if (categoryId && !validCategoryIds.has(categoryId)) {
      return { error: "Categoria não encontrada." };
    }

    const result = await updateTransaction({
      transactionsRepo,
      userId,
      householdId,
      transactionId,
      accountId,
      categoryId,
      type: type as TransactionType,
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
        case "CATEGORY_NOT_FOUND":
          return { error: "Categoria não encontrada." };
      }
    }

    return { ok: true };
  }

  if (intent === "delete") {
    const transactionId = String(form.get("transactionId") ?? "");

    const result = await deleteTransaction({
      transactionsRepo,
      userId,
      householdId,
      transactionId,
    });

    if (!result.ok) {
      return { error: "Transação não encontrada." };
    }

    return { ok: true };
  }

  return { error: "Ação inválida" };
}

export default function HouseholdTransactions({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <TransactionsPage
      accounts={loaderData.accounts}
      categories={loaderData.categories}
      transactions={loaderData.transactions}
      today={loaderData.today}
      error={actionData?.error}
      ok={actionData?.ok}
    />
  );
}
