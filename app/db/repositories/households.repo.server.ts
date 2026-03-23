import crypto from "node:crypto";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "~/db/db.server";
import {
  categories,
  householdPaymentShares,
  households,
  memberships,
  transactions,
  users,
} from "~/db/schema";
import type { HouseholdsRepo } from "~/domain/households/ports";
import {
  addMonthsUTC,
  monthLabelUTC,
  monthStartFromLabel,
  shiftDashboardMonthLabel,
} from "~/domain/dashboard/month";
import { resolveHouseholdPaymentShares } from "~/domain/households/share-resolution";

function createId(): string {
  return crypto.randomUUID();
}

const DEFAULT_CATEGORIES = [
  "Aluguel",
  "Luz",
  "Água",
  "Internet",
  "Cartão",
  "Mercado",
  "Outros",
];

function createMonthLabels(selectedMonthLabel: string, lookbackMonths: number) {
  const months = Math.max(1, Math.floor(lookbackMonths));
  const selectedMonthStart = monthStartFromLabel(selectedMonthLabel);
  const firstMonthStart = addMonthsUTC(selectedMonthStart, -(months - 1));

  return Array.from({ length: months }, (_, index) => monthLabelUTC(addMonthsUTC(firstMonthStart, index)));
}

async function mergeHouseholdExpenseByCategory(params: {
  householdId: string;
  userIds: string[];
  monthLabel: string;
}) {
  if (params.userIds.length === 0) {
    return { currentMonthExpenseCents: 0, expenseByCategory: [] as Array<{ categoryName: string; expenseCents: number }> };
  }

  const start = monthStartFromLabel(params.monthLabel);
  const end = addMonthsUTC(start, 1);
  const totalByCategory = new Map<string, number>();

  await Promise.all(
    params.userIds.map(async (userId) => {
      const txRows = await db
        .select({
          categoryName: sql<string>`coalesce(${categories.name}, 'Sem categoria')`,
          expenseCents: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
        })
        .from(transactions)
        .innerJoin(categories, eq(categories.id, transactions.categoryId))
        .where(
          and(
            eq(transactions.userId, userId),
            eq(transactions.householdId, params.householdId),
            eq(transactions.type, 'expense'),
            eq(categories.householdId, params.householdId),
            sql`${transactions.occurredAt} >= ${start}`,
            sql`${transactions.occurredAt} < ${end}`,
          ),
        )
        .groupBy(categories.name)
        .orderBy(desc(sql`coalesce(sum(${transactions.amountCents}), 0)`));

      for (const row of txRows) {
        totalByCategory.set(String(row.categoryName), (totalByCategory.get(String(row.categoryName)) ?? 0) + Number(row.expenseCents ?? 0));
      }
    }),
  );

  const expenseByCategory = Array.from(totalByCategory.entries())
    .map(([categoryName, expenseCents]) => ({ categoryName, expenseCents: Math.max(0, expenseCents) }))
    .filter((row) => row.expenseCents > 0)
    .sort((a, b) => b.expenseCents - a.expenseCents);

  return {
    currentMonthExpenseCents: expenseByCategory.reduce((acc, row) => acc + row.expenseCents, 0),
    expenseByCategory,
  };
}

async function resolveHouseholdMembersWithShares(householdId: string) {
  const members = await householdsRepo.listMembers(householdId);
  const shares = await householdsRepo.listPaymentShares(householdId);
  const resolved = resolveHouseholdPaymentShares({
    memberUserIds: members.map((member) => member.userId),
    explicitShares: shares,
  });

  if (!resolved.ok) {
    throw new Error(`Rateio persistido inválido para household ${householdId}: ${resolved.error}`);
  }

  const resolvedByUserId = new Map(resolved.shares.map((share) => [share.userId, share]));

  return members.map((member) => {
    const share = resolvedByUserId.get(member.userId);
    return {
      ...member,
      explicitShareBps: share?.explicitShareBps ?? null,
      effectiveShareBps: share?.effectiveShareBps ?? 0,
    };
  });
}

async function createDefaultCategories(params: {
  householdId: string;
  tx: Pick<typeof db, "insert">;
}) {
  for (const name of DEFAULT_CATEGORIES) {
    await params.tx.insert(categories).values({
      id: createId(),
      householdId: params.householdId,
      name,
    });
  }
}

export const householdsRepo: HouseholdsRepo = {
  async createHousehold(params) {
    await db.transaction(async (tx) => {
      await tx.insert(households).values({
        id: params.id,
        name: params.name,
      });

      await tx.insert(memberships).values({
        householdId: params.id,
        userId: params.adminUserId,
        role: "admin",
      });

      await createDefaultCategories({ householdId: params.id, tx });
    });

    return { householdId: params.id };
  },

  async createHouseholdWithAdmin(params) {
    return householdsRepo.createHousehold({
      id: createId(),
      adminUserId: params.adminUserId,
      name: params.name ?? "Casa",
    });
  },

  async listForUser(userId) {
    const rows = await db
      .select({
        householdId: households.id,
        name: households.name,
        role: memberships.role,
        createdAt: households.createdAt,
      })
      .from(memberships)
      .innerJoin(households, eq(households.id, memberships.householdId))
      .where(eq(memberships.userId, userId))
      .orderBy(asc(households.createdAt), asc(households.name));

    return rows.map((row) => ({
      householdId: row.householdId,
      name: row.name,
      role: row.role as "admin" | "member",
      createdAt: row.createdAt,
    }));
  },

  async findByIdForUser(params) {
    const row = await db
      .select({
        householdId: households.id,
        name: households.name,
        role: memberships.role,
        createdAt: households.createdAt,
      })
      .from(memberships)
      .innerJoin(households, eq(households.id, memberships.householdId))
      .where(and(eq(memberships.userId, params.userId), eq(households.id, params.householdId)))
      .limit(1);

    const access = row[0];
    if (!access) return null;

    return {
      householdId: access.householdId,
      name: access.name,
      role: access.role as "admin" | "member",
      createdAt: access.createdAt,
    };
  },

  async updateHouseholdName(params) {
    const rows = await db
      .update(households)
      .set({ name: params.name })
      .where(eq(households.id, params.householdId))
      .returning({ id: households.id });

    return rows.length > 0;
  },

  async listMembers(householdId) {
    const rows = await db
      .select({
        userId: users.id,
        username: users.username,
        role: memberships.role,
        createdAt: memberships.createdAt,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.householdId, householdId))
      .orderBy(asc(memberships.createdAt), asc(users.username));

    return rows.map((row) => ({
      userId: row.userId,
      username: row.username,
      role: row.role as "admin" | "member",
      createdAt: row.createdAt,
    }));
  },

  async findUserByUsername(username) {
    const row = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.username, username),
      columns: { id: true, username: true },
    });

    if (!row) return null;
    return row;
  },

  async addMember(params) {
    const inserted = await db
      .insert(memberships)
      .values({
        householdId: params.householdId,
        userId: params.userId,
        role: params.role,
      })
      .onConflictDoNothing()
      .returning({ userId: memberships.userId });

    return inserted.length > 0 ? "added" : "already_member";
  },

  async updateMemberRole(params) {
    const rows = await db
      .update(memberships)
      .set({ role: params.role })
      .where(and(eq(memberships.householdId, params.householdId), eq(memberships.userId, params.userId)))
      .returning({ userId: memberships.userId });

    return rows.length > 0;
  },

  async removeMember(params) {
    const rows = await db
      .delete(memberships)
      .where(and(eq(memberships.householdId, params.householdId), eq(memberships.userId, params.userId)))
      .returning({ userId: memberships.userId });

    return rows.length > 0;
  },

  async listPaymentShares(householdId) {
    const rows = await db.query.householdPaymentShares.findMany({
      where: (table, { eq }) => eq(table.householdId, householdId),
      orderBy: (table, { asc }) => [asc(table.userId)],
    });

    return rows.map((row) => ({ userId: row.userId, shareBps: row.shareBps }));
  },

  async replacePaymentShares(params) {
    await db.transaction(async (tx) => {
      await tx.delete(householdPaymentShares).where(eq(householdPaymentShares.householdId, params.householdId));

      if (params.shares.length > 0) {
        await tx.insert(householdPaymentShares).values(
          params.shares.map((share) => ({
            householdId: params.householdId,
            userId: share.userId,
            shareBps: share.shareBps,
          })),
        );
      }
    });
  },

  async listSummariesForUser(params) {
    const accesses = await householdsRepo.listForUser(params.userId);

    return Promise.all(
      accesses.map(async (access) => {
        const members = await resolveHouseholdMembersWithShares(access.householdId);
        const snapshot = await mergeHouseholdExpenseByCategory({
          householdId: access.householdId,
          userIds: members.map((member) => member.userId),
          monthLabel: params.monthLabel,
        });

        return {
          ...access,
          memberCount: members.length,
          currentMonthExpenseCents: snapshot.currentMonthExpenseCents,
          currentUserEffectiveShareBps:
            members.find((member) => member.userId === params.userId)?.effectiveShareBps ?? 0,
        };
      }),
    );
  },

  async getDetailsForUser(params) {
    const access = await householdsRepo.findByIdForUser({
      userId: params.userId,
      householdId: params.householdId,
    });
    if (!access) return null;

    const members = await resolveHouseholdMembersWithShares(params.householdId);
    const snapshot = await mergeHouseholdExpenseByCategory({
      householdId: params.householdId,
      userIds: members.map((member) => member.userId),
      monthLabel: params.monthLabel,
    });

    const monthLabels = createMonthLabels(params.monthLabel, params.lookbackMonths);
    const expenseSeries = await Promise.all(
      monthLabels.map(async (monthLabel) => {
        const monthSnapshot = await mergeHouseholdExpenseByCategory({
          householdId: params.householdId,
          userIds: members.map((member) => member.userId),
          monthLabel,
        });

        return {
          monthLabel,
          expenseCents: monthSnapshot.currentMonthExpenseCents,
        };
      }),
    );

    return {
      ...access,
      memberCount: members.length,
      currentMonthExpenseCents: snapshot.currentMonthExpenseCents,
      currentUserEffectiveShareBps:
        members.find((member) => member.userId === params.userId)?.effectiveShareBps ?? 0,
      monthLabel: params.monthLabel,
      previousMonthLabel: shiftDashboardMonthLabel(params.monthLabel, -1),
      nextMonthLabel: shiftDashboardMonthLabel(params.monthLabel, 1),
      expenseByCategory: snapshot.expenseByCategory,
      expenseSeries,
      members,
    };
  },
};
