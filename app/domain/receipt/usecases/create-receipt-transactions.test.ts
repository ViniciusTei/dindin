import { describe, expect, it } from "vitest";
import { createReceiptTransactions } from "./create-receipt-transactions";
import type { TransactionRunner } from "~/domain/shared/transaction";
import { makeIdFactory, makeTransactionsRepo, makeCreditCardPurchasesRepo, makeCreditCardsRepo } from "~/domain/test/fakes";
import type { ReceiptItem } from "~/domain/receipt/entity";

// Simple synchronous transaction runner for tests
function makeTransactionRunner(): TransactionRunner<never> {
  return {
    async run(work) {
      return work(undefined as never);
    },
  };
}

function makeItem(overrides: Partial<ReceiptItem> = {}): ReceiptItem {
  return {
    id: overrides.id ?? "item-1",
    name: overrides.name ?? "Arroz Tio João 5kg",
    quantity: overrides.quantity ?? 1,
    unitPriceCents: overrides.unitPriceCents ?? 2290,
    totalPriceCents: overrides.totalPriceCents ?? 2290,
  };
}

const BASE = {
  userId: "user-1",
  householdId: "household-1",
  storeName: "Pão de Açúcar" as string | null,
  date: new Date("2026-03-28T00:00:00.000Z"),
  categoryId: null as string | null,
  mode: "single" as const,
};

describe("createReceiptTransactions", () => {
  describe("validação", () => {
    it("retorna erro quando não há itens", async () => {
      const { repo: transactionsRepo } = makeTransactionsRepo({ accounts: [{ id: "acc-1" }] });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      const result = await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        paymentMethod: { type: "account", accountId: "acc-1" },
        items: [],
      });

      expect(result).toEqual({ ok: false, error: "Nenhum item para criar transações." });
    });
  });

  describe("modo single + conta", () => {
    it("cria uma única transação com o total dos itens", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      const items = [
        makeItem({ name: "Arroz", totalPriceCents: 2290 }),
        makeItem({ id: "item-2", name: "Feijão", totalPriceCents: 1700 }),
      ];

      const result = await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "single",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items,
      });

      expect(result).toEqual({ ok: true });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amountCents).toBe(3990); // 2290 + 1700
      expect(transactions[0].type).toBe("expense");
    });

    it("descreve como '{storeName} - Compras'", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        storeName: "Mercadão",
        mode: "single",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items: [makeItem()],
      });

      expect(transactions[0].description).toBe("Mercadão - Compras");
    });

    it("usa 'Compras no mercado' quando storeName é null", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        storeName: null,
        mode: "single",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items: [makeItem()],
      });

      expect(transactions[0].description).toBe("Compras no mercado");
    });

    it("usa a data da nota fiscal na transação", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();
      const receiptDate = new Date("2026-03-15T00:00:00.000Z");

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        date: receiptDate,
        mode: "single",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items: [makeItem()],
      });

      expect(transactions[0].occurredAt).toEqual(receiptDate);
    });
  });

  describe("modo per-item + conta", () => {
    it("cria uma transação por item", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      const items = [
        makeItem({ id: "i1", name: "Arroz", totalPriceCents: 2290 }),
        makeItem({ id: "i2", name: "Feijão", totalPriceCents: 1700 }),
        makeItem({ id: "i3", name: "Leite", totalPriceCents: 890 }),
      ];

      const result = await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "per-item",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items,
      });

      expect(result).toEqual({ ok: true });
      expect(transactions).toHaveLength(3);
    });

    it("descreve cada item como '{storeName} - {itemName}'", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      const items = [
        makeItem({ id: "i1", name: "Arroz" }),
        makeItem({ id: "i2", name: "Feijão" }),
      ];

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        storeName: "Extra",
        mode: "per-item",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items,
      });

      expect(transactions[0].description).toBe("Extra - Arroz");
      expect(transactions[1].description).toBe("Extra - Feijão");
    });

    it("usa só o nome do item quando storeName é null", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        storeName: null,
        mode: "per-item",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items: [makeItem({ name: "Leite Integral" })],
      });

      expect(transactions[0].description).toBe("Leite Integral");
    });

    it("usa o totalPriceCents de cada item como valor", async () => {
      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo();

      const items = [
        makeItem({ id: "i1", name: "Arroz", totalPriceCents: 2290 }),
        makeItem({ id: "i2", name: "Feijão", totalPriceCents: 3400 }),
      ];

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "per-item",
        paymentMethod: { type: "account", accountId: "acc-1" },
        items,
      });

      expect(transactions[0].amountCents).toBe(2290);
      expect(transactions[1].amountCents).toBe(3400);
    });
  });

  describe("modo single + cartão de crédito", () => {
    it("cria 1 purchase e N transações de parcelas quando há conta vinculada", async () => {
      const cardId = "card-1";
      const accountId = "acc-1";

      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: accountId }],
      });
      const { repo: purchasesRepo, purchases, purchaseTransactions } =
        makeCreditCardPurchasesRepo({ cardIds: [cardId] });

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "single",
        paymentMethod: {
          type: "credit-card",
          creditCardId: cardId,
          accountId,
          closingDay: 10,
          installments: 3,
        },
        items: [makeItem({ totalPriceCents: 9000 })],
      });

      expect(purchases).toHaveLength(1);
      expect(purchases[0].installmentsTotal).toBe(3);
      expect(purchases[0].amountCents).toBe(9000);
      expect(transactions).toHaveLength(3);
      expect(purchaseTransactions).toHaveLength(3);
    });

    it("divide o valor em parcelas corretas (sem centavo perdido)", async () => {
      const cardId = "card-1";
      const accountId = "acc-1";

      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: accountId }],
      });
      const { repo: purchasesRepo } = makeCreditCardPurchasesRepo({ cardIds: [cardId] });

      // 100 centavos em 3 parcelas → 34 + 33 + 33
      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "single",
        paymentMethod: {
          type: "credit-card",
          creditCardId: cardId,
          accountId,
          closingDay: 10,
          installments: 3,
        },
        items: [makeItem({ totalPriceCents: 100 })],
      });

      const amounts = transactions.map((t) => t.amountCents).sort((a, b) => b - a);
      expect(amounts).toEqual([34, 33, 33]);
      expect(amounts.reduce((s, v) => s + v, 0)).toBe(100);
    });

    it("cria purchase sem transações quando o cartão não tem conta vinculada", async () => {
      const cardId = "card-1";

      const { repo: transactionsRepo, transactions } = makeTransactionsRepo({
        accounts: [{ id: "acc-1" }],
      });
      const { repo: purchasesRepo, purchases } = makeCreditCardPurchasesRepo({
        cardIds: [cardId],
      });

      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "single",
        paymentMethod: {
          type: "credit-card",
          creditCardId: cardId,
          accountId: null, // no linked account
          closingDay: 10,
          installments: 1,
        },
        items: [makeItem({ totalPriceCents: 5000 })],
      });

      expect(purchases).toHaveLength(1);
      expect(transactions).toHaveLength(0);
    });
  });

  describe("modo per-item + cartão de crédito", () => {
    it("cria um purchase por item", async () => {
      const cardId = "card-1";
      const accountId = "acc-1";

      const { repo: transactionsRepo } = makeTransactionsRepo({
        accounts: [{ id: accountId }],
      });
      const { repo: purchasesRepo, purchases } = makeCreditCardPurchasesRepo({
        cardIds: [cardId],
      });

      const items = [
        makeItem({ id: "i1", name: "Arroz", totalPriceCents: 2290 }),
        makeItem({ id: "i2", name: "Feijão", totalPriceCents: 1700 }),
      ];

      const result = await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        mode: "per-item",
        paymentMethod: {
          type: "credit-card",
          creditCardId: cardId,
          accountId,
          closingDay: 10,
          installments: 1,
        },
        items,
      });

      expect(result).toEqual({ ok: true });
      expect(purchases).toHaveLength(2);
      expect(purchases[0].amountCents).toBe(2290);
      expect(purchases[1].amountCents).toBe(1700);
    });
  });

  describe("cálculo do firstInvoiceYm", () => {
    it("compra antes do fechamento vai para a fatura do mesmo mês", async () => {
      const cardId = "card-1";
      const accountId = "acc-1";

      const { repo: transactionsRepo } = makeTransactionsRepo({ accounts: [{ id: accountId }] });
      const { repo: purchasesRepo, purchases } = makeCreditCardPurchasesRepo({ cardIds: [cardId] });

      // closingDay=10, purchase day=5 → fatura do mesmo mês
      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        date: new Date("2026-03-05T00:00:00.000Z"),
        mode: "single",
        paymentMethod: {
          type: "credit-card",
          creditCardId: cardId,
          accountId,
          closingDay: 10,
          installments: 1,
        },
        items: [makeItem()],
      });

      expect(purchases[0].firstInvoiceYm).toBe("2026-03");
    });

    it("compra depois do fechamento vai para a fatura do mês seguinte", async () => {
      const cardId = "card-1";
      const accountId = "acc-1";

      const { repo: transactionsRepo } = makeTransactionsRepo({ accounts: [{ id: accountId }] });
      const { repo: purchasesRepo, purchases } = makeCreditCardPurchasesRepo({ cardIds: [cardId] });

      // closingDay=10, purchase day=15 → fatura do mês seguinte
      await createReceiptTransactions({
        transactionRunner: makeTransactionRunner(),
        transactionsRepo,
        purchasesRepo,
        idFactory: makeIdFactory(),
        ...BASE,
        date: new Date("2026-03-15T00:00:00.000Z"),
        mode: "single",
        paymentMethod: {
          type: "credit-card",
          creditCardId: cardId,
          accountId,
          closingDay: 10,
          installments: 1,
        },
        items: [makeItem()],
      });

      expect(purchases[0].firstInvoiceYm).toBe("2026-04");
    });
  });
});
