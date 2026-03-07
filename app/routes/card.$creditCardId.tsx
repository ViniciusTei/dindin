import type { Route } from "./+types/card.$creditCardId";
import crypto from "node:crypto";

import { requireUserId } from "~/auth/session.server";
import { accountsRepo } from "~/db/repositories/accounts.repo.server";
import { creditCardsRepo } from "~/db/repositories/credit-cards.repo.server";
import { creditCardPurchasesRepo } from "~/db/repositories/credit-card-purchases.repo.server";
import { creditCardPrepaymentsRepo } from "~/db/repositories/credit-card-prepayments.repo.server";
import { createCreditCardPurchase } from "~/domain/credit-cards/usecases/create-purchase";
import { anticipateInstallments } from "~/domain/credit-cards/usecases/anticipate-installments";
import { getCreditCardInvoice } from "~/domain/credit-cards/usecases/get-invoice";
import { computeInvoiceYmForDate } from "~/domain/credit-cards/invoice";
import { listAccounts } from "~/domain/accounts/usecases/list-accounts";
import { CreditCardPage } from "~/domain/credit-cards/ui/CreditCardPage";
import { decryptString } from "~/lib/crypto.server";
import { toCents } from "~/lib/money";

function createId(): string {
  return crypto.randomUUID();
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const creditCardId = String(params.creditCardId ?? "");

  const card = await creditCardsRepo.findById({ userId, creditCardId });
  if (!card) {
    return { notFound: true as const, error: "Cartão não encontrado." };
  }

  const url = new URL(request.url);
  const ymParam = url.searchParams.get("ym");
  const ym =
    ymParam && ymParam.trim()
      ? ymParam.trim()
      : computeInvoiceYmForDate({ occurredAt: new Date(), closingDay: card.closingDay });

  const [accounts, purchases, invoiceResult] = await Promise.all([
    listAccounts({ accountsRepo, userId }),
    creditCardPurchasesRepo.listByCard({ userId, creditCardId }),
    getCreditCardInvoice({
      purchasesRepo: creditCardPurchasesRepo,
      prepaymentsRepo: creditCardPrepaymentsRepo,
      userId,
      creditCardId,
      ym,
    }),
  ]);

  let last4 = "????";
  try {
    last4 = decryptString(card.numberEnc).slice(-4);
  } catch {
    // mantém mascarado
  }

  const invoice =
    invoiceResult.ok
      ? {
          ym: invoiceResult.invoice.ym,
          totalCents: invoiceResult.invoice.totalCents,
          lines: invoiceResult.invoice.lines.map((l) => ({
            purchaseId: l.purchaseId,
            description: l.description,
            amountCentsThisYm: l.amountCentsThisYm,
            billedThisYm: l.installments.billedThisYm,
            totalInstallments: l.installments.total,
          })),
        }
      : { ym, totalCents: 0, lines: [] };

  return {
    notFound: false as const,
    accounts,
    card: {
      id: card.id,
      brand: String(card.brand),
      last4,
      limitCents: card.limitCents,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      accountId: card.accountId,
    },
    invoice,
    purchases: purchases.map((p) => ({
      id: p.id,
      description: p.description,
      amountCents: p.amountCents,
      occurredAtIso: toIsoDate(p.occurredAt),
      installmentsTotal: p.installmentsTotal,
      firstInvoiceYm: p.firstInvoiceYm,
    })),
    ym,
  };
}

function clampDayUTC(year: number, month1to12: number, day: number): number {
  const last = new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
  return Math.min(day, last);
}

function computeCycleRangeUTC(params: { occurredAt: Date; closingDay: number }) {
  const y = params.occurredAt.getUTCFullYear();
  const m = params.occurredAt.getUTCMonth() + 1;
  const d = params.occurredAt.getUTCDate();

  const closesThisMonth = clampDayUTC(y, m, params.closingDay);

  let endY = y;
  let endM = m;
  if (d > closesThisMonth) {
    const next = new Date(Date.UTC(y, m, 1));
    endY = next.getUTCFullYear();
    endM = next.getUTCMonth() + 1;
  }

  const endDay = clampDayUTC(endY, endM, params.closingDay);
  const end = new Date(Date.UTC(endY, endM - 1, endDay, 23, 59, 59, 999));

  // start = dia seguinte ao fechamento anterior
  const prev = new Date(Date.UTC(endY, endM - 2, 1));
  const prevY = prev.getUTCFullYear();
  const prevM = prev.getUTCMonth() + 1;
  const prevEndDay = clampDayUTC(prevY, prevM, params.closingDay);
  const start = new Date(Date.UTC(prevY, prevM - 1, prevEndDay + 1, 0, 0, 0, 0));

  return { start, end };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const creditCardId = String(params.creditCardId ?? "");

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "purchase") {
    const description = String(form.get("description") ?? "");
    const amountCents = toCents(form.get("amount"));
    const occurredAtRaw = String(form.get("occurredAt") ?? "");
    const installmentsTotal = Number(form.get("installmentsTotal"));

    const occurredAt = occurredAtRaw
      ? new Date(`${occurredAtRaw}T00:00:00.000Z`)
      : new Date("invalid");

    const result = await createCreditCardPurchase({
      creditCardsRepo,
      purchasesRepo: creditCardPurchasesRepo,
      idFactory: createId,
      userId,
      creditCardId,
      categoryId: null,
      description,
      amountCents: amountCents ?? NaN,
      occurredAt,
      installmentsTotal,
    });

    if (!result.ok) {
      switch (result.error) {
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
          return { error: "Parcelas inválidas." };
      }
    }

    // alerta de limite (simples): soma compras do ciclo > limite
    const card = await creditCardsRepo.findById({ userId, creditCardId });
    if (card?.limitCents) {
      const { start, end } = computeCycleRangeUTC({ occurredAt, closingDay: card.closingDay });
      const existing = await creditCardPurchasesRepo.listByCard({ userId, creditCardId });
      const sum = existing
        .filter((p) => p.occurredAt >= start && p.occurredAt <= end)
        .reduce((acc, p) => acc + p.amountCents, 0);

      if (sum > card.limitCents) {
        return { ok: true, warning: "Atenção: limite do cartão excedido neste ciclo." };
      }
    }

    return { ok: true };
  }

  if (intent === "prepay") {
    const purchaseId = String(form.get("purchaseId") ?? "");
    const ym = String(form.get("ym") ?? "");
    const installmentsCount = Number(form.get("installmentsCount"));

    const result = await anticipateInstallments({
      purchasesRepo: creditCardPurchasesRepo,
      prepaymentsRepo: creditCardPrepaymentsRepo,
      idFactory: createId,
      now: () => new Date(),
      userId,
      purchaseId,
      ym,
      installmentsCount,
    });

    if (!result.ok) {
      switch (result.error) {
        case "PURCHASE_REQUIRED":
          return { error: "Compra é obrigatória." };
        case "PURCHASE_NOT_FOUND":
          return { error: "Compra não encontrada." };
        case "YM_INVALID":
          return { error: "Mês inválido." };
        case "COUNT_INVALID":
          return { error: "Quantidade inválida." };
      }
    }

    return { ok: true };
  }

  if (intent === "update") {
    const accountIdRaw = String(form.get("accountId") ?? "").trim();
    const accountId = accountIdRaw ? accountIdRaw : null;
    const limitCents = toCents(form.get("limit"));
    const closingDay = Number(form.get("closingDay"));
    const dueDay = Number(form.get("dueDay"));

    try {
      await creditCardsRepo.update({
        userId,
        creditCardId,
        accountId,
        limitCents,
        closingDay,
        dueDay,
      });
      return { ok: true };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Falha ao salvar." };
    }
  }

  return { error: "Ação inválida" };
}

export default function CardDetail({ loaderData, actionData }: Route.ComponentProps) {
  if (loaderData.notFound) {
    return (
      <div className="p-4">
        <div className="alert alert-error">
          <span>{loaderData.error}</span>
        </div>
      </div>
    );
  }

  return (
    <CreditCardPage
      accounts={loaderData.accounts}
      card={loaderData.card}
      invoice={loaderData.invoice}
      purchases={loaderData.purchases}
      error={actionData?.error}
      warning={actionData?.warning}
      ok={actionData?.ok}
    />
  );
}
