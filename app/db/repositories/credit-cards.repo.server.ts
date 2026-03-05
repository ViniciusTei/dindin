import { and, asc, eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { accounts, creditCards } from "~/db/schema";
import {
  CreditCardAccountNotFoundError,
  CreditCardNotFoundError,
} from "~/domain/credit-cards/errors";
import type { CreditCardsRepo } from "~/domain/credit-cards/ports";

async function assertAccountBelongsToUser(params: {
  userId: string;
  accountId: string;
}) {
  const rows = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, params.accountId), eq(accounts.userId, params.userId)))
    .limit(1);

  if (rows.length === 0) throw new CreditCardAccountNotFoundError();
}

export const creditCardsRepo: CreditCardsRepo = {
  async listByUser(userId) {
    const rows = await db.query.creditCards.findMany({
      where: (t, { eq }) => eq(t.userId, userId),
      orderBy: (t) => asc(t.createdAt),
    });

    return rows.map((c) => ({
      id: c.id,
      userId: c.userId,
      accountId: c.accountId,
      numberEnc: c.numberEnc,
      expirationEnc: c.expirationEnc,
      cvvEnc: c.cvvEnc,
      brand: c.brand as any,
      limitCents: c.limitCents,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      createdAt: c.createdAt,
    }));
  },

  async findById(params) {
    const rows = await db.query.creditCards.findMany({
      where: (t, { and, eq }) =>
        and(eq(t.userId, params.userId), eq(t.id, params.creditCardId)),
      limit: 1,
    });

    const c = rows[0];
    if (!c) return null;

    return {
      id: c.id,
      userId: c.userId,
      accountId: c.accountId,
      numberEnc: c.numberEnc,
      expirationEnc: c.expirationEnc,
      cvvEnc: c.cvvEnc,
      brand: c.brand as any,
      limitCents: c.limitCents,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      createdAt: c.createdAt,
    };
  },

  async create(params) {
    if (params.accountId) {
      await assertAccountBelongsToUser({ userId: params.userId, accountId: params.accountId });
    }

    await db.insert(creditCards).values({
      id: params.id,
      userId: params.userId,
      accountId: params.accountId,
      numberEnc: params.numberEnc,
      expirationEnc: params.expirationEnc,
      cvvEnc: params.cvvEnc,
      brand: params.brand,
      limitCents: params.limitCents,
      closingDay: params.closingDay,
      dueDay: params.dueDay,
    });
  },

  async update(params) {
    if (params.accountId) {
      await assertAccountBelongsToUser({ userId: params.userId, accountId: params.accountId });
    }

    const updated = await db
      .update(creditCards)
      .set({
        accountId: params.accountId,
        limitCents: params.limitCents,
        closingDay: params.closingDay,
        dueDay: params.dueDay,
      })
      .where(and(eq(creditCards.id, params.creditCardId), eq(creditCards.userId, params.userId)))
      .returning({ id: creditCards.id });

    if (updated.length === 0) throw new CreditCardNotFoundError();
  },

  async delete(params) {
    const deleted = await db
      .delete(creditCards)
      .where(and(eq(creditCards.id, params.creditCardId), eq(creditCards.userId, params.userId)))
      .returning({ id: creditCards.id });

    if (deleted.length === 0) throw new CreditCardNotFoundError();
  },
};
