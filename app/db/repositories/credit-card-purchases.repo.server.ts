import crypto from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { resolveClient } from "~/db/db.server";
import type { DbExecutor } from "~/db/db.server";
import type { DbTransaction } from "~/db/db.server";
import { creditCardPurchases, creditCards, creditCardPurchaseTransactions } from "~/db/schema";
import { CreditCardNotFoundError, CreditCardPurchaseNotFoundError } from "~/domain/credit-cards/errors";
import type { CreditCardPurchasesRepo } from "~/domain/credit-cards/ports";

async function assertCardBelongsToUser(params: { userId: string; creditCardId: string; tx?: DbExecutor }) {
  const client = resolveClient(params.tx);
  const rows = await client
    .select({ id: creditCards.id })
    .from(creditCards)
    .where(and(eq(creditCards.id, params.creditCardId), eq(creditCards.userId, params.userId)))
    .limit(1);

  if (rows.length === 0) throw new CreditCardNotFoundError();
}

export const creditCardPurchasesRepo: CreditCardPurchasesRepo<DbTransaction> = {
  async listByCard(params) {
    const client = resolveClient(params.tx);
    const rows = await client.query.creditCardPurchases.findMany({
      where: (t, { and, eq }) =>
        and(eq(t.userId, params.userId), eq(t.creditCardId, params.creditCardId)),
      orderBy: (t) => [desc(t.occurredAt), desc(t.createdAt)],
    });

    return rows.map((p) => ({
      id: p.id,
      userId: p.userId,
      creditCardId: p.creditCardId,
      categoryId: p.categoryId,
      description: p.description,
      amountCents: p.amountCents,
      occurredAt: p.occurredAt,
      installmentsTotal: p.installmentsTotal,
      firstInvoiceYm: p.firstInvoiceYm,
      createdAt: p.createdAt,
    }));
  },

  async findById(params) {
    const client = resolveClient(params.tx);
    const rows = await client.query.creditCardPurchases.findMany({
      where: (t, { and, eq }) => and(eq(t.userId, params.userId), eq(t.id, params.purchaseId)),
      limit: 1,
    });

    const p = rows[0];
    if (!p) return null;

    return {
      id: p.id,
      userId: p.userId,
      creditCardId: p.creditCardId,
      categoryId: p.categoryId,
      description: p.description,
      amountCents: p.amountCents,
      occurredAt: p.occurredAt,
      installmentsTotal: p.installmentsTotal,
      firstInvoiceYm: p.firstInvoiceYm,
      createdAt: p.createdAt,
    };
  },

  async create(params) {
    const client = resolveClient(params.tx);
    await assertCardBelongsToUser({ userId: params.userId, creditCardId: params.creditCardId, tx: client });

    await client.insert(creditCardPurchases).values({
      id: params.id,
      userId: params.userId,
      creditCardId: params.creditCardId,
      categoryId: params.categoryId,
      description: params.description,
      amountCents: params.amountCents,
      occurredAt: params.occurredAt,
      installmentsTotal: params.installmentsTotal,
      firstInvoiceYm: params.firstInvoiceYm,
    });
  },

  async linkTransaction(params) {
    const client = resolveClient(params.tx);
    // ensure purchase belongs to user
    const rows = await client.query.creditCardPurchases.findMany({
      where: (t, { and, eq }) => and(eq(t.userId, params.userId), eq(t.id, params.purchaseId)),
      limit: 1,
    });
    if (rows.length === 0) throw new CreditCardPurchaseNotFoundError();

    await client.insert(creditCardPurchaseTransactions).values({
      id: crypto.randomUUID(),
      purchaseId: params.purchaseId,
      transactionId: params.transactionId,
    });
  },
};
