import { and, asc, eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { creditCardPurchasePrepayments, creditCardPurchases } from "~/db/schema";
import { CreditCardPurchaseNotFoundError } from "~/domain/credit-cards/errors";
import type { CreditCardPrepaymentsRepo } from "~/domain/credit-cards/ports";

async function assertPurchaseBelongsToUser(params: { userId: string; purchaseId: string }) {
  const rows = await db
    .select({ id: creditCardPurchases.id })
    .from(creditCardPurchases)
    .where(and(eq(creditCardPurchases.id, params.purchaseId), eq(creditCardPurchases.userId, params.userId)))
    .limit(1);

  if (rows.length === 0) throw new CreditCardPurchaseNotFoundError();
}

export const creditCardPrepaymentsRepo: CreditCardPrepaymentsRepo = {
  async listByCard(params) {
    // Join para filtrar por creditCardId.
    const rows = await db
      .select({
        id: creditCardPurchasePrepayments.id,
        userId: creditCardPurchasePrepayments.userId,
        purchaseId: creditCardPurchasePrepayments.purchaseId,
        ym: creditCardPurchasePrepayments.ym,
        installmentsCount: creditCardPurchasePrepayments.installmentsCount,
        createdAt: creditCardPurchasePrepayments.createdAt,
      })
      .from(creditCardPurchasePrepayments)
      .innerJoin(
        creditCardPurchases,
        eq(creditCardPurchasePrepayments.purchaseId, creditCardPurchases.id)
      )
      .where(
        and(
          eq(creditCardPurchasePrepayments.userId, params.userId),
          eq(creditCardPurchases.creditCardId, params.creditCardId)
        )
      )
      .orderBy(asc(creditCardPurchasePrepayments.createdAt));

    return rows.map((p) => ({
      id: p.id,
      userId: p.userId,
      purchaseId: p.purchaseId,
      ym: p.ym,
      installmentsCount: p.installmentsCount,
      createdAt: p.createdAt,
    }));
  },

  async create(params) {
    await assertPurchaseBelongsToUser({ userId: params.userId, purchaseId: params.purchaseId });

    await db.insert(creditCardPurchasePrepayments).values({
      id: params.id,
      userId: params.userId,
      purchaseId: params.purchaseId,
      ym: params.ym,
      installmentsCount: params.installmentsCount,
      createdAt: params.createdAt,
    });
  },
};
