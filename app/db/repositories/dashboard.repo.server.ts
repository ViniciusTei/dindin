
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "~/db/db.server";
import { categories, transactions } from "~/db/schema";

export async function getMonthTotals(params: {
  userId: string;
  start: Date;
  end: Date;
}): Promise<{ incomeCents: number; expenseCents: number }> {
  const incomeExpr = sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountCents} else 0 end), 0)`;
  const expenseExpr = sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountCents} else 0 end), 0)`;

  const rows = await db
    .select({ incomeCents: incomeExpr, expenseCents: expenseExpr })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, params.userId),
        gte(transactions.occurredAt, params.start),
        lt(transactions.occurredAt, params.end)
      )
    );

  return {
    incomeCents: Number(rows[0]?.incomeCents ?? 0),
    expenseCents: Number(rows[0]?.expenseCents ?? 0),
  };
}

export async function getExpenseByCategory(params: {
  userId: string;
  householdId: string;
  start: Date;
  end: Date;
}): Promise<Array<{ categoryId: string | null; categoryName: string; expenseCents: number }>> {
  const categoryNameExpr = sql<string>`coalesce(${categories.name}, 'Sem categoria')`;
  const sumExpr = sql<number>`coalesce(sum(${transactions.amountCents}), 0)`;

  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categoryNameExpr,
      expenseCents: sumExpr,
    })
    .from(transactions)
    .leftJoin(
      categories,
      and(
        eq(categories.id, transactions.categoryId),
        eq(categories.householdId, params.householdId)
      )
    )
    .where(
      and(
        eq(transactions.userId, params.userId),
        eq(transactions.type, "expense"),
        gte(transactions.occurredAt, params.start),
        lt(transactions.occurredAt, params.end)
      )
    )
    .groupBy(transactions.categoryId, categories.name)
    .orderBy(desc(sumExpr));

  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: String(r.categoryName),
    expenseCents: Number(r.expenseCents ?? 0),
  }));
}
