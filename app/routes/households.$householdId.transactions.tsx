import type { Route } from "./+types/households.$householdId.transactions";
import crypto from "node:crypto";

import { requireHouseholdAccess } from "~/auth/household.server";
import { requireUserId } from "~/auth/session.server";
import { drizzleTransactionRunner } from "~/db/db.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { categoriesRepo } from "~/db/repositories/categories.repo.server";
import { transactionsRepo } from "~/db/repositories/transactions.repo.server";
import { creditCardsRepo } from "~/db/repositories/credit-cards.repo.server";
import { creditCardPurchasesRepo } from "~/db/repositories/credit-card-purchases.repo.server";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { listCategories } from "~/domain/categories/usecases/list-categories";
import { listCreditCards } from "~/domain/credit-cards/usecases/list-credit-cards";
import type { TransactionType } from "~/domain/transactions/entity";
import { createTransaction } from "~/domain/transactions/usecases/create-transaction";
import { createCreditCardPurchaseInHousehold } from "~/domain/credit-cards/usecases/create-purchase-in-household";
import { deleteTransaction } from "~/domain/transactions/usecases/delete-transaction";
import { listTransactions } from "~/domain/transactions/usecases/list-transactions";
import { updateTransaction } from "~/domain/transactions/usecases/update-transaction";
import { TransactionsPage } from "~/domain/transactions/ui/TransactionsPage";
import { toCents } from "~/lib/money";
import { decryptString } from "~/lib/crypto.server";

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

import { redirect } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  await requireHouseholdAccess({ userId, householdId });

  const url = new URL(request.url);
  const ok = url.searchParams.get("ok") === "1";

  const [accounts, categories, transactions, cards] = await Promise.all([
    listAccounts({ accountsRepo, userId }),
    listCategories({ categoriesRepo, householdId }),
    listTransactions({ transactionsRepo, userId, householdId }),
    listCreditCards({ creditCardsRepo, userId }),
  ]);

  const accountNameById = new Map(accounts.map((account) => [account.id, account.name] as const));

  let warning: string | undefined;
  const viewCards = cards.map((c) => {
    let last4 = "????";
    try {
      const number = decryptString(c.numberEnc);
      last4 = number.slice(-4);
    } catch (err) {
      warning =
        warning ??
        (err instanceof Error ? err.message : "Falha ao decriptografar dados do cartão.");
    }

    return {
      id: c.id,
      brand: String(c.brand),
      last4,
      limitCents: c.limitCents,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      accountId: c.accountId,
    };
  });

  return {
    accounts,
    categories,
    transactions: transactions.map((transaction) => ({
      ...transaction,
      accountName: accountNameById.get(transaction.accountId),
    })),
    today: todayISODate(),
    cards: viewCards,
    warning,
    ok,
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
    // allow overriding accountId if card forces a specific linked account
    let accountId = String(form.get("accountId") ?? "");
    const categoryIdRaw = String(form.get("categoryId") ?? "").trim();
    const categoryId = categoryIdRaw ? categoryIdRaw : null;
    const type = String(form.get("type") ?? "");
    const description = String(form.get("description") ?? "");
    const amountCents = toCents(form.get("amount"));
    const occurredAt = parseDateInput(form.get("occurredAt"));

    if (categoryId && !validCategoryIds.has(categoryId)) {
      return { error: "Categoria não encontrada." };
    }

    const creditCardIdRaw = String(form.get("creditCardId") ?? "").trim();
    const creditCardId = creditCardIdRaw ? creditCardIdRaw : null;
    const installmentsTotalRaw = String(form.get("installmentsTotal") ?? "1").trim();
    const installmentsTotal = Number(installmentsTotalRaw) || 1;

    if (creditCardId) {
      // fetch card to validate and prefer its linked account if present
      const card = await creditCardsRepo.findById({ userId, creditCardId });
      if (!card) {
        return { error: "Cartão não encontrado." };
      }

      if (card.accountId) {
        accountId = card.accountId;
      }

      const res = await createCreditCardPurchaseInHousehold({
        transactionRunner: drizzleTransactionRunner,
        creditCardsRepo,
        purchasesRepo: creditCardPurchasesRepo,
        transactionsRepo,
        idFactory: createId,
        userId,
        householdId,
        accountId,
        creditCardId,
        categoryId,
        description,
        amountCents: amountCents ?? NaN,
        occurredAt: occurredAt ?? new Date("invalid"),
        installmentsTotal,
      });

      if (!res.ok) {
        switch (res.error) {
          case "CARD_REQUIRED":
            return { error: "Cartão é obrigatório." };
          case "CARD_NOT_FOUND":
            return { error: "Cartão não encontrado." };
          case "DESCRIPTION_REQUIRED":
            return { error: "Descrição é obrigatória." };
          case "AMOUNT_INVALID":
            return { error: "Valor inválido." };
          case "DATE_REQUIRED":
            return { error: "Data é obrigatória." };
          case "INSTALLMENTS_INVALID":
            return { error: "Número de parcelas inválido." };
          case "TRANSACTION_ERROR": {
            const causeError = res.causeError as string | undefined;
            const detail = res.cause as string | undefined;

            // Map known transaction-level errors to friendly messages
            switch (causeError) {
              case "ACCOUNT_REQUIRED":
                return { error: "Conta é obrigatória." };
              case "ACCOUNT_NOT_FOUND":
                return { error: "Conta não encontrada." };
              case "CATEGORY_NOT_FOUND":
                return { error: "Categoria não encontrada." };
              case "DESCRIPTION_REQUIRED":
                return { error: "Descrição é obrigatória." };
              case "AMOUNT_INVALID":
                return { error: "Valor inválido." };
              case "DATE_REQUIRED":
                return { error: "Data é obrigatória." };
              case "LINK_FAILED":
                return { error: detail ? `Falha ao vincular transação ao purchase: ${detail}` : "Falha ao vincular transação." };
              default:
                return { error: detail ? `Falha ao criar transações: ${detail}` : "Falha ao criar transações." };
            }
          }
        }
      }

      const url = new URL(request.url);
      url.searchParams.set('ok', '1');
      return redirect(url.pathname + url.search);
    }

    // fallback to normal transaction creation
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

    const url = new URL(request.url);
    url.searchParams.set('ok', '1');
    return redirect(url.pathname + url.search);
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

    const url = new URL(request.url);
    url.searchParams.set('ok', '1');
    return redirect(url.pathname + url.search);
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

    const url = new URL(request.url);
    url.searchParams.set('ok', '1');
    return redirect(url.pathname + url.search);
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
      error={actionData?.error ?? loaderData?.warning}
      ok={Boolean(loaderData?.ok)}
      actionOk={Boolean(loaderData?.ok)}
      loaderOk={Boolean(loaderData?.ok)}
      cards={loaderData.cards}
    />
  );
}
