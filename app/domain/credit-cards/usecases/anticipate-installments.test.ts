import { describe, expect, it } from "vitest";

import { anticipateInstallments } from "~/domain/credit-cards/usecases/anticipate-installments";
import {
  makeCreditCardPrepaymentsRepo,
  makeCreditCardPurchasesRepo,
  makeIdFactory,
  makeNow,
} from "~/domain/test/fakes";

describe("anticipateInstallments", () => {
  it("cria antecipação vinculada à compra", async () => {
    const { repo: purchasesRepo } = makeCreditCardPurchasesRepo({
      purchases: [
        {
          id: "p1",
          userId: "user-1",
          creditCardId: "c1",
          categoryId: null,
          description: "TV",
          amountCents: 300,
          occurredAt: new Date("2026-03-01T00:00:00.000Z"),
          installmentsTotal: 3,
          firstInvoiceYm: "2026-03",
        },
      ],
      cardIds: ["c1"],
    });

    const { repo: prepaymentsRepo, prepayments } = makeCreditCardPrepaymentsRepo({
      purchaseToCardId: { p1: "c1" },
    });

    const result = await anticipateInstallments({
      purchasesRepo,
      prepaymentsRepo,
      idFactory: makeIdFactory("pp"),
      now: makeNow("2026-03-05T00:00:00.000Z"),
      userId: "user-1",
      purchaseId: "p1",
      ym: "2026-03",
      installmentsCount: 2,
    });

    expect(result.ok).toBe(true);
    expect(prepayments).toHaveLength(1);
    expect(prepayments[0]?.installmentsCount).toBe(2);
  });
});
