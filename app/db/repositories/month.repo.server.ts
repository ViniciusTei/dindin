import { and, eq, inArray } from "drizzle-orm";

import { db } from "~/db/db.server";
import {
  categories,
  expenses,
  incomes,
  memberships,
  months,
  transfers,
  users,
} from "~/db/schema";
import type { MonthRepo } from "~/domain/month/ports";

export const monthRepo: MonthRepo = {
  async getMonth(params) {
    const month = await db.query.months.findFirst({
      where: (t, { and, eq }) =>
        and(eq(t.id, params.monthId), eq(t.householdId, params.householdId)),
    });

    if (!month) return null;

    return {
      id: month.id,
      householdId: month.householdId,
      ym: month.ym,
      status: month.status === "closed" ? "closed" : "open",
    };
  },

  async listMembers(params) {
    const rows = await db
      .select({
        userId: memberships.userId,
        role: memberships.role,
        username: users.username,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.householdId, params.householdId));

    return rows;
  },

  async listIncomes(params) {
    if (params.userIds.length === 0) return [];

    return db
      .select({ userId: incomes.userId, amountCents: incomes.amountCents })
      .from(incomes)
      .where(
        and(eq(incomes.monthId, params.monthId), inArray(incomes.userId, params.userIds))
      );
  },

  async listExpenses(params) {
    return db
      .select({ amountCents: expenses.amountCents })
      .from(expenses)
      .where(eq(expenses.monthId, params.monthId));
  },

  async deleteIncome(params) {
    await db
      .delete(incomes)
      .where(and(eq(incomes.monthId, params.monthId), eq(incomes.userId, params.userId)));
  },

  async upsertIncome(params) {
    const existing = await db.query.incomes.findFirst({
      where: (t, { and, eq }) => and(eq(t.monthId, params.monthId), eq(t.userId, params.userId)),
    });

    if (existing) {
      await db.update(incomes).set({ amountCents: params.amountCents }).where(eq(incomes.id, existing.id));
      return;
    }

    await db.insert(incomes).values({
      id: params.idFactory(),
      monthId: params.monthId,
      userId: params.userId,
      amountCents: params.amountCents,
    });
  },

  async addExpense(params) {
    await db.insert(expenses).values({
      id: params.idFactory(),
      monthId: params.monthId,
      categoryId: params.categoryId,
      description: params.description,
      amountCents: params.amountCents,
      isPaid: false,
    });
  },

  async toggleExpensePaid(params) {
    await db
      .update(expenses)
      .set({ isPaid: params.isPaid })
      .where(and(eq(expenses.id, params.expenseId), eq(expenses.monthId, params.monthId)));
  },

  async deleteExpense(params) {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, params.expenseId), eq(expenses.monthId, params.monthId)));
  },

  async replaceTransfers(params) {
    await db.delete(transfers).where(eq(transfers.monthId, params.monthId));

    for (const t of params.transfers) {
      await db.insert(transfers).values({
        id: params.idFactory(),
        monthId: params.monthId,
        fromUserId: t.fromUserId,
        toUserId: t.toUserId,
        amountCents: t.amountCents,
      });
    }
  },

  async closeMonth(params) {
    await db
      .update(months)
      .set({ status: "closed", closedAt: params.closedAt })
      .where(eq(months.id, params.monthId));
  },

  async reopenMonth(params) {
    await db
      .update(months)
      .set({ status: "open", closedAt: null })
      .where(eq(months.id, params.monthId));
  },

  async completeTransfer(params) {
    await db
      .update(transfers)
      .set({ completedAt: params.completedAt })
      .where(and(eq(transfers.id, params.transferId), eq(transfers.monthId, params.monthId)));
  },
};

export async function getMonthDetailReadModel(params: {
  monthId: string;
  householdId: string;
  expenseOrder?: "asc" | "desc";
}) {
  const month = await db.query.months.findFirst({
    where: (t, { and, eq }) => and(eq(t.id, params.monthId), eq(t.householdId, params.householdId)),
  });
  if (!month) return null;

  const membersRows = await monthRepo.listMembers({ householdId: params.householdId });
  const memberUserIds = membersRows.map((m) => m.userId);

  const incomeRows = await monthRepo.listIncomes({ monthId: params.monthId, userIds: memberUserIds });
  const expenseRows = await db.query.expenses.findMany({
    where: (t, { eq }) => eq(t.monthId, params.monthId),
    orderBy: (t, order) =>
      (params.expenseOrder ?? "desc") === "asc"
        ? order.asc(t.createdAt)
        : order.desc(t.createdAt),
  });

  const cats = await db.query.categories.findMany({
    where: (t, { eq }) => eq(t.householdId, params.householdId),
    orderBy: (t, { asc }) => asc(t.name),
  });

  const transferRows = await db.query.transfers.findMany({
    where: (t, { eq }) => eq(t.monthId, params.monthId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });

  return {
    month,
    members: membersRows,
    incomes: incomeRows,
    expenses: expenseRows,
    categories: cats,
    transfers: transferRows,
  };
}
