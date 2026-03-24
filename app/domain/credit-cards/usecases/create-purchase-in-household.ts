import type { CreditCardsRepo, CreditCardPurchasesRepo } from "~/domain/credit-cards/ports";
import type { TransactionsRepo } from "~/domain/transactions/ports";
import { createCreditCardPurchase } from "~/domain/credit-cards/usecases/create-purchase";
import { createTransaction } from "~/domain/transactions/usecases/create-transaction";

export async function createCreditCardPurchaseInHousehold(params: {
  creditCardsRepo: CreditCardsRepo;
  purchasesRepo: CreditCardPurchasesRepo;
  transactionsRepo: TransactionsRepo;
  idFactory: () => string;
  userId: string;
  householdId: string;
  accountId: string;
  creditCardId: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  occurredAt: Date;
  installmentsTotal: number;
}): Promise<
  | { ok: true; purchaseId: string; transactionIds: string[]; firstInvoiceYm: string }
  | {
      ok: false;
      error:
        | "CARD_REQUIRED"
        | "CARD_NOT_FOUND"
        | "DESCRIPTION_REQUIRED"
        | "AMOUNT_INVALID"
        | "DATE_REQUIRED"
        | "INSTALLMENTS_INVALID"
        | "TRANSACTION_ERROR";
    }
> {
  const purchaseResult = await createCreditCardPurchase({
    creditCardsRepo: params.creditCardsRepo,
    purchasesRepo: params.purchasesRepo,
    idFactory: params.idFactory,
    userId: params.userId,
    creditCardId: params.creditCardId as unknown as string, // will be validated by createCreditCardPurchase
    categoryId: params.categoryId,
    description: params.description,
    amountCents: params.amountCents,
    occurredAt: params.occurredAt,
    installmentsTotal: params.installmentsTotal,
  } as any);

  if (!purchaseResult.ok) {
    return { ok: false, error: purchaseResult.error } as any;
  }

  const n = params.installmentsTotal;
  const total = params.amountCents;
  const base = Math.floor(total / n);
  const rem = total - base * n;

  const transactionIds: string[] = [];

  for (let i = 0; i < n; i++) {
    const installmentAmount = base + (i < rem ? 1 : 0);
    // use first day of month for installments to keep consistent with dashboard helpers
    const installmentDate = new Date(Date.UTC(params.occurredAt.getUTCFullYear(), params.occurredAt.getUTCMonth() + i, params.occurredAt.getUTCDate(), 0, 0, 0));

    const res = await createTransaction({
      transactionsRepo: params.transactionsRepo,
      idFactory: params.idFactory,
      userId: params.userId,
      householdId: params.householdId,
      accountId: params.accountId,
      categoryId: params.categoryId,
      type: "expense",
      description: `${params.description} (parcela ${i + 1}/${n})`,
      amountCents: installmentAmount,
      occurredAt: installmentDate,
    });

    if (!res.ok) {
      return { ok: false, error: "TRANSACTION_ERROR" };
    }

    transactionIds.push(res.transactionId);

    try {
      await params.purchasesRepo.linkTransaction({
        userId: params.userId,
        purchaseId: purchaseResult.purchaseId,
        transactionId: res.transactionId,
      });
    } catch (err) {
      return { ok: false, error: "TRANSACTION_ERROR" };
    }
  }

  return { ok: true, purchaseId: purchaseResult.purchaseId, transactionIds, firstInvoiceYm: purchaseResult.firstInvoiceYm };
}
