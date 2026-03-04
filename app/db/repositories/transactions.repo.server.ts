import { and, desc, eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { accounts, transactions } from "~/db/schema";
import {
  TransactionAccountNotFoundError,
  TransactionNotFoundError,
} from "~/domain/transactions/errors";
import type { TransactionsRepo } from "~/domain/transactions/ports";

async function assertAccountBelongsToUser(params: {
  userId: string;
  accountId: string;
}) {
  const rows = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, params.accountId), eq(accounts.userId, params.userId)))
    .limit(1);

  if (rows.length === 0) throw new TransactionAccountNotFoundError();
}

export const transactionsRepo: TransactionsRepo = {
  async listByUser(userId) {
    const rows = await db.query.transactions.findMany({
      where: (t, { eq }) => eq(t.userId, userId),
      orderBy: (t) => [desc(t.occurredAt), desc(t.createdAt)],
    });

    return rows.map((t) => ({
      id: t.id,
      userId: t.userId,
      accountId: t.accountId,
      type: t.type as "income" | "expense",
      description: t.description,
      amountCents: t.amountCents,
      occurredAt: t.occurredAt,
      createdAt: t.createdAt,
    }));
  },

  async create(params) {
    await assertAccountBelongsToUser({ userId: params.userId, accountId: params.accountId });

    await db.insert(transactions).values({
      id: params.id,
      userId: params.userId,
      accountId: params.accountId,
      type: params.type,
      description: params.description,
      amountCents: params.amountCents,
      occurredAt: params.occurredAt,
    });
  },

  async update(params) {
    await assertAccountBelongsToUser({ userId: params.userId, accountId: params.accountId });

    const updated = await db
      .update(transactions)
      .set({
        accountId: params.accountId,
        type: params.type,
        description: params.description,
        amountCents: params.amountCents,
        occurredAt: params.occurredAt,
      })
      .where(and(eq(transactions.id, params.transactionId), eq(transactions.userId, params.userId)))
      .returning({ id: transactions.id });

    if (updated.length === 0) throw new TransactionNotFoundError();
  },

  async delete(params) {
    const deleted = await db
      .delete(transactions)
      .where(and(eq(transactions.id, params.transactionId), eq(transactions.userId, params.userId)))
      .returning({ id: transactions.id });

    if (deleted.length === 0) throw new TransactionNotFoundError();
  },
};
