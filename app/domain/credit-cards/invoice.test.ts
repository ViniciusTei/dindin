import { describe, expect, it } from "vitest";

import {
  buildInvoice,
  computeInvoiceYmForDate,
  splitInstallments,
} from "~/domain/credit-cards/invoice";

describe("invoice utils", () => {
  it("splitInstallments distribui resto", () => {
    expect(splitInstallments(100, 3)).toEqual([34, 33, 33]);
  });

  it("computeInvoiceYmForDate respeita closingDay", () => {
    const ym1 = computeInvoiceYmForDate({
      occurredAt: new Date("2026-03-05T00:00:00.000Z"),
      closingDay: 10,
    });
    expect(ym1).toBe("2026-03");

    const ym2 = computeInvoiceYmForDate({
      occurredAt: new Date("2026-03-11T00:00:00.000Z"),
      closingDay: 10,
    });
    expect(ym2).toBe("2026-04");
  });

  it("computeInvoiceYmForDate faz clamp em meses curtos", () => {
    const ym = computeInvoiceYmForDate({
      occurredAt: new Date("2026-02-20T00:00:00.000Z"),
      closingDay: 31,
    });
    expect(ym).toBe("2026-02");
  });
});

describe("buildInvoice", () => {
  it("cobra parcela e antecipa do fim, reduzindo parcelas futuras", () => {
    const purchases = [
      {
        id: "p1",
        userId: "u1",
        creditCardId: "c1",
        categoryId: null,
        description: "Notebook",
        amountCents: 100,
        occurredAt: new Date("2026-03-01T00:00:00.000Z"),
        installmentsTotal: 3,
        firstInvoiceYm: "2026-03",
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ];

    const prepayments = [
      {
        id: "pp1",
        userId: "u1",
        purchaseId: "p1",
        ym: "2026-03",
        installmentsCount: 1,
        createdAt: new Date("2026-03-02T00:00:00.000Z"),
      },
    ];

    const invMar = buildInvoice({
      creditCardId: "c1",
      ym: "2026-03",
      purchases,
      prepayments,
    });
    // 100 em 3 => [34,33,33]; antecipa 1 do fim (33) + parcela normal (34)
    expect(invMar.totalCents).toBe(67);

    const invApr = buildInvoice({
      creditCardId: "c1",
      ym: "2026-04",
      purchases,
      prepayments,
    });
    expect(invApr.totalCents).toBe(33);

    const invMay = buildInvoice({
      creditCardId: "c1",
      ym: "2026-05",
      purchases,
      prepayments,
    });
    // última parcela foi antecipada, então zera
    expect(invMay.totalCents).toBe(0);
  });
});
