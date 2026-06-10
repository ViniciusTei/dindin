import { describe, expect, it } from "vitest";

import { createCreditCardPurchaseInHousehold } from "./create-purchase-in-household";
import type { TransactionRunner } from "~/domain/shared/transaction";
import { makeCreditCardsRepo, makeCreditCardPurchasesRepo, makeTransactionsRepo, makeIdFactory } from "~/domain/test/fakes";

const noopTransactionRunner: TransactionRunner<object> = {
  async run(work) {
    return work({});
  },
};

describe("createCreditCardPurchaseInHousehold", () => {
  it("creates purchase and installment transactions", async () => {
    const { repo: cardsRepo } = makeCreditCardsRepo({
      cards: [
        {
          id: "c1",
          userId: "user-1",
          accountId: null,
          numberEnc: "x",
          expirationEnc: "x",
          cvvEnc: null,
          brand: "visa",
          limitCents: null,
          nickname: "Meu cartão",
          closingDay: 10,
          dueDay: 15,
        },
      ],
    });

    const { repo: purchasesRepo, purchases } = makeCreditCardPurchasesRepo({ cardIds: ["c1"] });

    const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
      accounts: [{ id: "acc1" }],
      categories: [{ id: "cat1" }],
    });

    const result = await createCreditCardPurchaseInHousehold({
      transactionRunner: noopTransactionRunner,
      creditCardsRepo: cardsRepo,
      purchasesRepo,
      transactionsRepo,
      idFactory: makeIdFactory("id"),
      userId: "user-1",
      householdId: "household-1",
      accountId: "acc1",
      creditCardId: "c1",
      categoryId: "cat1",
      description: "Mercado",
      amountCents: 100,
      occurredAt: new Date("2026-03-11T00:00:00.000Z"),
      installmentsTotal: 3,
    });

    expect(result.ok).toBe(true);
    expect(purchases).toHaveLength(1);
    expect(transactions).toHaveLength(3);

    const amounts = transactions.map((t) => t.amountCents);
    expect(amounts).toEqual([34, 33, 33]);
  });
});
