import type { Route } from "./+types/cards";
import crypto from "node:crypto";

import { requireUserId } from "~/auth/session.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { creditCardsRepo } from "~/db/repositories/credit-cards.repo.server";
import { createCreditCard } from "~/domain/credit-cards/usecases/create-credit-card";
import { listCreditCards } from "~/domain/credit-cards/usecases/list-credit-cards";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { CreditCardsPage } from "~/domain/credit-cards/ui/CreditCardsPage";
import { detectCreditCardBrand } from "~/lib/credit-card-brand.server";
import { decryptString, encryptString } from "~/lib/crypto.server";
import { toCents } from "~/lib/money";

function createId(): string {
  return crypto.randomUUID();
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  const [accounts, cards] = await Promise.all([
    listAccounts({ accountsRepo, userId }),
    listCreditCards({ creditCardsRepo, userId }),
  ]);

  let warning: string | undefined;

  const viewCards = cards.map((c) => {
    let last4 = "????";
    try {
      if (c.numberEnc) {
        const number = decryptString(c.numberEnc);
        last4 = number.slice(-4);
      }
    } catch (err) {
      warning =
        warning ??
        (err instanceof Error ? err.message : "Falha ao decriptografar dados do cartão.");
    }

    return {
      id: c.id,
      nickname: c.nickname,
      brand: String(c.brand ?? ""),
      last4,
      limitCents: c.limitCents,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      accountId: c.accountId,
    };
  });

  return { accounts, cards: viewCards, warning };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent !== "create") return { error: "Ação inválida" };

  const nickname = String(form.get("nickname") ?? "");
  const number = String(form.get("number") ?? "");
  const expiration = String(form.get("expiration") ?? "");
  const cvv = String(form.get("cvv") ?? "");

  const limitCents = toCents(form.get("limit"));
  const closingDayRaw = form.get("closingDay");
  const dueDayRaw = form.get("dueDay");
  const closingDay = closingDayRaw ? Number(closingDayRaw) : null;
  const dueDay = dueDayRaw ? Number(dueDayRaw) : null;

  const accountIdRaw = String(form.get("accountId") ?? "").trim();
  const accountId = accountIdRaw ? accountIdRaw : null;

  try {
    const result = await createCreditCard({
      creditCardsRepo,
      crypto: { encrypt: encryptString, decrypt: decryptString },
      detectBrand: detectCreditCardBrand,
      idFactory: createId,
      userId,
      accountId,
      nickname,
      number: number || null,
      expiration: expiration || null,
      cvv: cvv || null,
      limitCents,
      closingDay,
      dueDay,
    });

    if (!result.ok) {
      switch (result.error) {
        case "NICKNAME_REQUIRED":
          return { error: "Apelido é obrigatório." };
        case "NUMBER_INVALID":
          return { error: "Número inválido." };
        case "EXPIRATION_INVALID":
          return { error: "Validade inválida (use MM/AA)." };
        case "CVV_INVALID":
          return { error: "CVV inválido." };
        case "LIMIT_INVALID":
          return { error: "Limite inválido." };
        case "CLOSING_DAY_INVALID":
          return { error: "Dia de fechamento inválido." };
        case "DUE_DAY_INVALID":
          return { error: "Dia de vencimento inválido." };
        case "ACCOUNT_NOT_FOUND":
          return { error: "Conta vinculada não encontrada." };
      }
    }

    return { ok: true };
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "Falha ao cadastrar cartão (erro inesperado).",
    };
  }
}

export default function Cards({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <CreditCardsPage
      accounts={loaderData.accounts}
      cards={loaderData.cards}
      error={actionData?.error}
      warning={loaderData.warning}
      ok={actionData?.ok}
    />
  );
}
