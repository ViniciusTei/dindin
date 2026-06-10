import type { CreditCardsRepo, CreditCardPurchasesRepo } from "~/domain/credit-cards/ports";
import { CreditCardNotFoundError } from "~/domain/credit-cards/errors";
import { computeInvoiceYmForDate } from "~/domain/credit-cards/invoice";

export async function createCreditCardPurchase<TTx>(params: {
  creditCardsRepo: CreditCardsRepo<TTx>;
  purchasesRepo: CreditCardPurchasesRepo<TTx>;
  idFactory: () => string;
  userId: string;
  creditCardId: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  occurredAt: Date;
  installmentsTotal: number;
  tx?: TTx;
}): Promise<
  | { ok: true; purchaseId: string; firstInvoiceYm: string }
  | {
      ok: false;
      error:
        | "CARD_REQUIRED"
        | "CARD_NOT_FOUND"
        | "DESCRIPTION_REQUIRED"
        | "AMOUNT_INVALID"
        | "DATE_REQUIRED"
        | "INSTALLMENTS_INVALID";
    }
> {
  if (!params.creditCardId) return { ok: false, error: "CARD_REQUIRED" };

  const description = params.description.trim();
  if (!description) return { ok: false, error: "DESCRIPTION_REQUIRED" };

  if (!Number.isInteger(params.amountCents) || params.amountCents <= 0) {
    return { ok: false, error: "AMOUNT_INVALID" };
  }

  if (!(params.occurredAt instanceof Date) || Number.isNaN(params.occurredAt.getTime())) {
    return { ok: false, error: "DATE_REQUIRED" };
  }

  if (!Number.isInteger(params.installmentsTotal) || params.installmentsTotal < 1 || params.installmentsTotal > 120) {
    return { ok: false, error: "INSTALLMENTS_INVALID" };
  }

  const card = await params.creditCardsRepo.findById({
    userId: params.userId,
    creditCardId: params.creditCardId,
    tx: params.tx,
  });
  if (!card) return { ok: false, error: "CARD_NOT_FOUND" };

  if (card.closingDay == null) {
    return { ok: false, error: "CARD_NOT_FOUND" };
  }

  const firstInvoiceYm = computeInvoiceYmForDate({
    occurredAt: params.occurredAt,
    closingDay: card.closingDay,
  });

  const id = params.idFactory();

  try {
    await params.purchasesRepo.create({
      id,
      userId: params.userId,
      creditCardId: params.creditCardId,
      categoryId: params.categoryId,
      description,
      amountCents: params.amountCents,
      occurredAt: params.occurredAt,
      installmentsTotal: params.installmentsTotal,
      firstInvoiceYm,
      tx: params.tx,
    });

    return { ok: true, purchaseId: id, firstInvoiceYm };
  } catch (err) {
    if (err instanceof CreditCardNotFoundError) return { ok: false, error: "CARD_NOT_FOUND" };
    throw err;
  }
}
