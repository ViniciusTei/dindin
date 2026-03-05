import type {
  CreditCardPrepaymentsRepo,
  CreditCardPurchasesRepo,
} from "~/domain/credit-cards/ports";
import { buildInvoice, isValidYm } from "~/domain/credit-cards/invoice";

export async function getCreditCardInvoice(params: {
  purchasesRepo: CreditCardPurchasesRepo;
  prepaymentsRepo: CreditCardPrepaymentsRepo;
  userId: string;
  creditCardId: string;
  ym: string;
}) {
  if (!isValidYm(params.ym)) {
    return { ok: false as const, error: "YM_INVALID" as const };
  }

  const purchases = await params.purchasesRepo.listByCard({
    userId: params.userId,
    creditCardId: params.creditCardId,
  });

  const prepayments = await params.prepaymentsRepo.listByCard({
    userId: params.userId,
    creditCardId: params.creditCardId,
  });

  const invoice = buildInvoice({
    creditCardId: params.creditCardId,
    ym: params.ym,
    purchases,
    prepayments,
  });

  return { ok: true as const, invoice };
}
