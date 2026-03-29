import type { TransactionRunner } from "~/domain/shared/transaction";
import type { TransactionsRepo } from "~/domain/transactions/ports";
import type { CreditCardPurchasesRepo } from "~/domain/credit-cards/ports";
import type { ReceiptItem } from "~/domain/receipt/entity";
import { computeInvoiceYmForDate } from "~/domain/credit-cards/invoice";

export type PaymentMethod =
  | { type: "account"; accountId: string }
  | {
      type: "credit-card";
      creditCardId: string;
      accountId: string | null;
      closingDay: number;
      installments: number;
    };

type Input<TTx> = {
  transactionRunner: TransactionRunner<TTx>;
  transactionsRepo: TransactionsRepo<TTx>;
  purchasesRepo: CreditCardPurchasesRepo<TTx>;
  idFactory: () => string;
  userId: string;
  householdId: string;
  storeName: string | null;
  date: Date;
  categoryId: string | null;
  paymentMethod: PaymentMethod;
  mode: "single" | "per-item";
  items: ReceiptItem[];
};

function buildDescription(storeName: string | null, itemName?: string): string {
  if (itemName) {
    return storeName ? `${storeName} - ${itemName}` : itemName;
  }
  return storeName ? `${storeName} - Compras` : "Compras no mercado";
}

async function createPurchaseWithInstallments<TTx>(params: {
  transactionsRepo: TransactionsRepo<TTx>;
  purchasesRepo: CreditCardPurchasesRepo<TTx>;
  idFactory: () => string;
  userId: string;
  householdId: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  date: Date;
  creditCardId: string;
  cardAccountId: string | null;
  cardClosingDay: number;
  installments: number;
  tx: TTx;
}): Promise<void> {
  const firstInvoiceYm = computeInvoiceYmForDate({
    occurredAt: params.date,
    closingDay: params.cardClosingDay,
  });

  const purchaseId = params.idFactory();

  await params.purchasesRepo.create({
    id: purchaseId,
    userId: params.userId,
    creditCardId: params.creditCardId,
    categoryId: params.categoryId,
    description: params.description,
    amountCents: params.amountCents,
    occurredAt: params.date,
    installmentsTotal: params.installments,
    firstInvoiceYm,
    tx: params.tx,
  });

  const accountId = params.cardAccountId;
  if (!accountId) return;

  const n = params.installments;
  const base = Math.floor(params.amountCents / n);
  const rem = params.amountCents - base * n;

  for (let i = 0; i < n; i++) {
    const installmentAmount = base + (i < rem ? 1 : 0);
    const installmentDate = new Date(
      Date.UTC(
        params.date.getUTCFullYear(),
        params.date.getUTCMonth() + i,
        params.date.getUTCDate(),
      ),
    );

    const transactionId = params.idFactory();

    await params.transactionsRepo.create({
      id: transactionId,
      userId: params.userId,
      householdId: params.householdId,
      accountId,
      categoryId: params.categoryId,
      type: "expense",
      description: n > 1 ? `${params.description} (parcela ${i + 1}/${n})` : params.description,
      amountCents: installmentAmount,
      occurredAt: installmentDate,
      tx: params.tx,
    });

    await params.purchasesRepo.linkTransaction({
      userId: params.userId,
      purchaseId,
      transactionId,
      tx: params.tx,
    });
  }
}

export async function createReceiptTransactions<TTx>(
  params: Input<TTx>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (params.items.length === 0) {
    return { ok: false, error: "Nenhum item para criar transações." };
  }

  try {
    await params.transactionRunner.run(async (tx) => {
      if (params.mode === "single") {
        const description = buildDescription(params.storeName);
        const amountCents = params.items.reduce((s, i) => s + i.totalPriceCents, 0);

        if (params.paymentMethod.type === "account") {
          await params.transactionsRepo.create({
            id: params.idFactory(),
            userId: params.userId,
            householdId: params.householdId,
            accountId: params.paymentMethod.accountId,
            categoryId: params.categoryId,
            type: "expense",
            description,
            amountCents,
            occurredAt: params.date,
            tx,
          });
        } else {
          await createPurchaseWithInstallments({
            transactionsRepo: params.transactionsRepo,
            purchasesRepo: params.purchasesRepo,
            idFactory: params.idFactory,
            userId: params.userId,
            householdId: params.householdId,
            categoryId: params.categoryId,
            description,
            amountCents,
            date: params.date,
            creditCardId: params.paymentMethod.creditCardId,
            cardAccountId: params.paymentMethod.accountId,
            cardClosingDay: params.paymentMethod.closingDay,
            installments: params.paymentMethod.installments,
            tx,
          });
        }
      } else {
        for (const item of params.items) {
          const description = buildDescription(params.storeName, item.name);
          const amountCents = item.totalPriceCents;

          if (params.paymentMethod.type === "account") {
            await params.transactionsRepo.create({
              id: params.idFactory(),
              userId: params.userId,
              householdId: params.householdId,
              accountId: params.paymentMethod.accountId,
              categoryId: params.categoryId,
              type: "expense",
              description,
              amountCents,
              occurredAt: params.date,
              tx,
            });
          } else {
            await createPurchaseWithInstallments({
              transactionsRepo: params.transactionsRepo,
              purchasesRepo: params.purchasesRepo,
              idFactory: params.idFactory,
              userId: params.userId,
              householdId: params.householdId,
              categoryId: params.categoryId,
              description,
              amountCents,
              date: params.date,
              creditCardId: params.paymentMethod.creditCardId,
              cardAccountId: params.paymentMethod.accountId,
              cardClosingDay: params.paymentMethod.closingDay,
              installments: params.paymentMethod.installments,
              tx,
            });
          }
        }
      }
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro ao criar transações." };
  }
}
