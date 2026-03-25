import { and, desc, eq } from "drizzle-orm";

import { resolveClient } from "~/db/db.server";
import type { DbExecutor } from "~/db/db.server";
import type { DbTransaction } from "~/db/db.server";
import { accounts, categories, transactions } from "~/db/schema";
import {
  TransactionAccountNotFoundError,
  TransactionCategoryNotFoundError,
  TransactionNotFoundError,
} from "~/domain/transactions/errors";
import type { TransactionsRepo } from "~/domain/transactions/ports";

async function assertAccountBelongsToUser(params: { userId: string; accountId: string; tx?: DbExecutor }) {
  const client = resolveClient(params.tx);
  const rows = await client
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, params.accountId), eq(accounts.userId, params.userId)))
    .limit(1);

  if (rows.length === 0) throw new TransactionAccountNotFoundError();
}

export const transactionsRepo: TransactionsRepo<DbTransaction> = {
  async listByHousehold(params) {
    const client = resolveClient();
    const rows = await client.query.transactions.findMany({
      where: (t, { and, eq }) =>
        and(eq(t.userId, params.userId), eq(t.householdId, params.householdId)),
      orderBy: (t) => [desc(t.occurredAt), desc(t.createdAt)],
    });

    return rows.map((t) => ({
      id: t.id,
      userId: t.userId,
      householdId: t.householdId,
      accountId: t.accountId,
      categoryId: t.categoryId,
      type: t.type as "income" | "expense",
      description: t.description,
      amountCents: t.amountCents,
      occurredAt: t.occurredAt,
      createdAt: t.createdAt,
    }));
  },

  async create(params) {
    const client = resolveClient(params.tx);

    await assertAccountBelongsToUser({ userId: params.userId, accountId: params.accountId, tx: client });

    if (params.categoryId) {
      const exists = await client
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.id, params.categoryId), eq(categories.householdId, params.householdId)))
        .limit(1);
      if (exists.length === 0) throw new TransactionCategoryNotFoundError();
    }

    await client.insert(transactions).values({
      id: params.id,
      userId: params.userId,
      householdId: params.householdId,
      accountId: params.accountId,
      categoryId: params.categoryId,
      type: params.type,
      description: params.description,
      amountCents: params.amountCents,
      occurredAt: params.occurredAt,
    });
  },

  async update(params) {
    const client = resolveClient(params.tx);

    await assertAccountBelongsToUser({ userId: params.userId, accountId: params.accountId, tx: client });

    if (params.categoryId) {
      const exists = await client
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.id, params.categoryId), eq(categories.householdId, params.householdId)))
        .limit(1);
      if (exists.length === 0) throw new TransactionCategoryNotFoundError();
    }

    const updated = await client
      .update(transactions)
      .set({
        accountId: params.accountId,
        categoryId: params.categoryId,
        type: params.type,
        description: params.description,
        amountCents: params.amountCents,
        occurredAt: params.occurredAt,
      })
      .where(
        and(
          eq(transactions.id, params.transactionId),
          eq(transactions.userId, params.userId),
          eq(transactions.householdId, params.householdId)
        )
      )
      .returning({ id: transactions.id });

    if (updated.length === 0) throw new TransactionNotFoundError();
  },

  async delete(params) {
    const client = resolveClient(params.tx);

    const deleted = await client
      .delete(transactions)
      .where(
        and(
          eq(transactions.id, params.transactionId),
          eq(transactions.userId, params.userId),
          eq(transactions.householdId, params.householdId)
        )
      )
      .returning({ id: transactions.id });

    if (deleted.length === 0) throw new TransactionNotFoundError();
  },
};
