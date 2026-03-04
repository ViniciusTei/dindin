import { and, asc, eq, inArray, sql } from "drizzle-orm";

import { db } from "~/db/db.server";
import { accounts, transactions } from "~/db/schema";
import {
  AccountAlreadyExistsError,
  AccountNotFoundError,
} from "~/domain/accounts/errors";
import type { AccountsRepo } from "~/domain/accounts/ports";

export const accountsRepo: AccountsRepo = {
  async listByUser(userId) {
    const rows = await db.query.accounts.findMany({
      where: (t, { eq }) => eq(t.userId, userId),
      orderBy: (t) => asc(t.name),
    });

    return rows.map((a) => ({
      id: a.id,
      userId: a.userId,
      name: a.name,
      initialBalanceCents: a.initialBalanceCents,
      createdAt: a.createdAt,
    }));
  },

  async create(params) {
    try {
      await db.insert(accounts).values({
        id: params.id,
        userId: params.userId,
        name: params.name,
        initialBalanceCents: params.initialBalanceCents,
      });
    } catch {
      throw new AccountAlreadyExistsError();
    }
  },

  async rename(params) {
    try {
      const updated = await db
        .update(accounts)
        .set({ name: params.name })
        .where(and(eq(accounts.id, params.accountId), eq(accounts.userId, params.userId)))
        .returning({ id: accounts.id });

      if (updated.length === 0) throw new AccountNotFoundError();
    } catch (err) {
      if (err instanceof AccountNotFoundError) throw err;
      throw new AccountAlreadyExistsError();
    }
  },

  async delete(params) {
    const deleted = await db
      .delete(accounts)
      .where(and(eq(accounts.id, params.accountId), eq(accounts.userId, params.userId)))
      .returning({ id: accounts.id });

    if (deleted.length === 0) throw new AccountNotFoundError();
  },

  async countTransactionsByAccount(params) {
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(eq(transactions.userId, params.userId), eq(transactions.accountId, params.accountId)));

    return Number(rows[0]?.count ?? 0);
  },

  async sumSignedTransactionsByAccountIds(params) {
    if (params.accountIds.length === 0) return {};

    const sumExpr = sql<number>`sum(case when ${transactions.type} = 'income' then ${transactions.amountCents} else -${transactions.amountCents} end)`;

    const rows = await db
      .select({ accountId: transactions.accountId, sum: sumExpr })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, params.userId),
          inArray(transactions.accountId, params.accountIds)
        )
      )
      .groupBy(transactions.accountId);

    const byId: Record<string, number> = {};
    for (const r of rows) {
      byId[String(r.accountId)] = Number(r.sum ?? 0);
    }
    return byId;
  },
};
