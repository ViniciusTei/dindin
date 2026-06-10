import { describe, expect, it } from "vitest";

import { createCreditCardPurchase } from "~/domain/credit-cards/usecases/create-purchase";
import { makeCreditCardPurchasesRepo, makeCreditCardsRepo, makeIdFactory } from "~/domain/test/fakes";

describe("createCreditCardPurchase", () => {
  it("calcula firstInvoiceYm a partir do closingDay do cartão", async () => {
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

    const { repo: purchasesRepo, purchases } = makeCreditCardPurchasesRepo({
      cardIds: ["c1"],
    });

    const result = await createCreditCardPurchase({
      creditCardsRepo: cardsRepo,
      purchasesRepo,
      idFactory: makeIdFactory("p"),
      userId: "user-1",
      creditCardId: "c1",
      categoryId: null,
      description: "Mercado",
      amountCents: 100,
      occurredAt: new Date("2026-03-11T00:00:00.000Z"),
      installmentsTotal: 1,
    });

    expect(result.ok).toBe(true);
    expect(purchases).toHaveLength(1);
    expect(purchases[0]?.firstInvoiceYm).toBe("2026-04");
  });
});
