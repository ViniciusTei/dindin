import { and, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db } from "~/db/db.server";
import {
  categories,
  creditCardPurchases,
  creditCards,
  transactions,
} from "~/db/schema";
import {
  addMonthsToYm,
  buildInvoice,
  computeInvoiceYmForDate,
} from "~/domain/credit-cards/invoice";
import {
  addMonthsUTC,
  monthLabelUTC,
  monthStartUTC,
  resolveDashboardMonthLabel,
} from "~/domain/dashboard/month";
import type { DashboardRepo } from "~/domain/dashboard/ports";

function createMonthLabels(start: Date, endExclusive: Date): string[] {
  const labels: string[] = [];
  for (
    let cursor = monthStartUTC(start);
    cursor < endExclusive;
    cursor = addMonthsUTC(cursor, 1)
  ) {
    labels.push(monthLabelUTC(cursor));
  }
  return labels;
}

function resolveInvoiceYmForDashboardMonth(params: {
  dashboardMonthLabel: string;
  selectedMonthLabel: string;
  currentDashboardMonthLabel: string;
  now: Date;
  closingDay: number;
}) {
  if (
    params.dashboardMonthLabel !== params.selectedMonthLabel ||
    params.selectedMonthLabel !== params.currentDashboardMonthLabel
  ) {
    return params.dashboardMonthLabel;
  }
  return computeInvoiceYmForDate({
    occurredAt: params.now,
    closingDay: params.closingDay,
  });
}

function overlapsYmRange(params: {
  firstInvoiceYm: string;
  installmentsTotal: number;
  startYm: string;
  endYmInclusive: string;
}) {
  const lastInvoiceYm = addMonthsToYm(
    params.firstInvoiceYm,
    Math.max(0, params.installmentsTotal - 1),
  );
  return (
    params.firstInvoiceYm <= params.endYmInclusive &&
    lastInvoiceYm >= params.startYm
  );
}

type DashboardCardPurchase = {
  id: string;
  userId: string;
  creditCardId: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  occurredAt: Date;
  installmentsTotal: number;
  firstInvoiceYm: string;
  createdAt: Date;
};

type DashboardCardPrepayment = {
  id: string;
  userId: string;
  purchaseId: string;
  ym: string;
  installmentsCount: number;
  createdAt: Date;
};

async function listDashboardCardPurchases(params: {
  userId: string;
  cardIds: string[];
  endYmInclusive: string;
  startYm: string;
}): Promise<DashboardCardPurchase[]> {
  if (params.cardIds.length === 0) return [];

  const purchases = await db.query.creditCardPurchases.findMany({
    where: (purchase, { and, eq, inArray, lte }) =>
      and(
        eq(purchase.userId, params.userId),
        inArray(purchase.creditCardId, params.cardIds),
        lte(purchase.firstInvoiceYm, params.endYmInclusive),
      ),
    orderBy: (purchase) => [desc(purchase.createdAt)],
  });

  return purchases
    .map((purchase) => ({
      id: purchase.id,
      userId: purchase.userId,
      creditCardId: purchase.creditCardId,
      categoryId: purchase.categoryId,
      description: purchase.description,
      amountCents: purchase.amountCents,
      occurredAt: purchase.occurredAt,
      installmentsTotal: purchase.installmentsTotal,
      firstInvoiceYm: purchase.firstInvoiceYm,
      createdAt: purchase.createdAt,
    }))
    .filter((purchase) =>
      overlapsYmRange({
        firstInvoiceYm: purchase.firstInvoiceYm,
        installmentsTotal: purchase.installmentsTotal,
        startYm: params.startYm,
        endYmInclusive: params.endYmInclusive,
      }),
    );
}

async function listDashboardCardPrepayments(params: {
  userId: string;
  purchaseIds: string[];
}): Promise<DashboardCardPrepayment[]> {
  if (params.purchaseIds.length === 0) return [];

  const prepayments = await db.query.creditCardPurchasePrepayments.findMany({
    where: (prepayment, { and, eq, inArray }) =>
      and(
        eq(prepayment.userId, params.userId),
        inArray(prepayment.purchaseId, params.purchaseIds),
      ),
    orderBy: (prepayment) => [prepayment.createdAt],
  });

  return prepayments.map((prepayment) => ({
    id: prepayment.id,
    userId: prepayment.userId,
    purchaseId: prepayment.purchaseId,
    ym: prepayment.ym,
    installmentsCount: prepayment.installmentsCount,
    createdAt: prepayment.createdAt,
  }));
}

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
        lt(transactions.occurredAt, params.end),
      ),
    );

  return {
    incomeCents: Number(rows[0]?.incomeCents ?? 0),
    expenseCents: Number(rows[0]?.expenseCents ?? 0),
  };
}

export async function getMonthlyTotals(params: {
  userId: string;
  start: Date;
  end: Date;
}): Promise<
  Array<{ monthLabel: string; incomeCents: number; expenseCents: number }>
> {
  const monthExpr = sql<string>`to_char(date_trunc('month', ${transactions.occurredAt}), 'YYYY-MM')`;
  const incomeExpr = sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amountCents} else 0 end), 0)`;
  const expenseExpr = sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amountCents} else 0 end), 0)`;

  const rows = await db
    .select({
      monthLabel: monthExpr,
      incomeCents: incomeExpr,
      expenseCents: expenseExpr,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, params.userId),
        gte(transactions.occurredAt, params.start),
        lt(transactions.occurredAt, params.end),
      ),
    )
    .groupBy(monthExpr)
    .orderBy(monthExpr);

  return rows.map((row) => ({
    monthLabel: String(row.monthLabel),
    incomeCents: Number(row.incomeCents ?? 0),
    expenseCents: Number(row.expenseCents ?? 0),
  }));
}

export async function getExpenseByCategory(params: {
  userId: string;
  householdId: string;
  start: Date;
  end: Date;
}): Promise<
  Array<{
    categoryId: string | null;
    categoryName: string;
    expenseCents: number;
  }>
> {
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
        eq(categories.householdId, params.householdId),
      ),
    )
    .where(
      and(
        eq(transactions.userId, params.userId),
        eq(transactions.type, "expense"),
        gte(transactions.occurredAt, params.start),
        lt(transactions.occurredAt, params.end),
      ),
    )
    .groupBy(transactions.categoryId, categories.name)
    .orderBy(desc(sumExpr));

  return rows.map((row) => ({
    categoryId: row.categoryId,
    categoryName: String(row.categoryName),
    expenseCents: Number(row.expenseCents ?? 0),
  }));
}

export async function getCreditCardMonthlyExpenses(params: {
  userId: string;
  start: Date;
  end: Date;
  now?: Date;
  selectedMonthLabel?: string;
}): Promise<Array<{ monthLabel: string; expenseCents: number }>> {
  const now = params.now ?? new Date();
  const selectedMonthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: params.selectedMonthLabel,
    now,
  });
  const monthLabels = createMonthLabels(params.start, params.end);
  if (monthLabels.length === 0) return [];

  const startYm = monthLabels[0]!;
  const endYmInclusive = monthLabels[monthLabels.length - 1]!;
  const purchasesEndYmInclusive = addMonthsToYm(endYmInclusive, 1);
  const currentDashboardMonthLabel = monthLabelUTC(monthStartUTC(now));

  const cards = await db
    .select({ id: creditCards.id, closingDay: creditCards.closingDay })
    .from(creditCards)
    .where(eq(creditCards.userId, params.userId));
  if (cards.length === 0) return [];

  const cardIds = cards.map((card) => card.id);
  const purchases = await listDashboardCardPurchases({
    userId: params.userId,
    cardIds,
    startYm,
    endYmInclusive: purchasesEndYmInclusive,
  });
  if (purchases.length === 0) return [];

  const prepayments = await listDashboardCardPrepayments({
    userId: params.userId,
    purchaseIds: purchases.map((purchase) => purchase.id),
  });

  const prepaymentsByCardId = new Map<string, DashboardCardPrepayment[]>();
  const purchaseCardById = new Map(
    purchases.map((purchase) => [purchase.id, purchase.creditCardId]),
  );
  for (const prepayment of prepayments) {
    const cardId = purchaseCardById.get(prepayment.purchaseId);
    if (!cardId) continue;
    const list = prepaymentsByCardId.get(cardId) ?? [];
    list.push(prepayment);
    prepaymentsByCardId.set(cardId, list);
  }

  const purchasesByCardId = new Map<string, DashboardCardPurchase[]>();
  for (const purchase of purchases) {
    const list = purchasesByCardId.get(purchase.creditCardId) ?? [];
    list.push(purchase);
    purchasesByCardId.set(purchase.creditCardId, list);
  }

  const totalsByMonth = new Map<string, number>();
  for (const label of monthLabels) {
    totalsByMonth.set(label, 0);
  }

  for (const card of cards) {
    const purchasesByCard = purchasesByCardId.get(card.id) ?? [];
    if (purchasesByCard.length === 0) continue;

    const cardPrepayments = prepaymentsByCardId.get(card.id) ?? [];
    for (const dashboardMonthLabel of monthLabels) {
      const invoiceYm = resolveInvoiceYmForDashboardMonth({
        dashboardMonthLabel,
        selectedMonthLabel,
        currentDashboardMonthLabel,
        now,
        closingDay: card.closingDay,
      });
      const invoice = buildInvoice({
        creditCardId: card.id,
        ym: invoiceYm,
        purchases: purchasesByCard,
        prepayments: cardPrepayments,
      });
      totalsByMonth.set(
        dashboardMonthLabel,
        (totalsByMonth.get(dashboardMonthLabel) ?? 0) + invoice.totalCents,
      );
    }
  }

  return monthLabels.map((monthLabel) => ({
    monthLabel,
    expenseCents: totalsByMonth.get(monthLabel) ?? 0,
  }));
}

export async function getCreditCardExpenseByCategory(params: {
  userId: string;
  householdId: string;
  start: Date;
  end: Date;
  now?: Date;
  selectedMonthLabel?: string;
}): Promise<Array<{ categoryName: string; expenseCents: number }>> {
  const now = params.now ?? new Date();
  const selectedMonthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: params.selectedMonthLabel,
    now,
  });
  const monthLabels = createMonthLabels(params.start, params.end);
  if (monthLabels.length === 0) return [];

  const startYm = monthLabels[0]!;
  const endYmInclusive = monthLabels[monthLabels.length - 1]!;
  const purchasesEndYmInclusive = addMonthsToYm(endYmInclusive, 1);
  const currentDashboardMonthLabel = monthLabelUTC(monthStartUTC(now));

  const cards = await db
    .select({ id: creditCards.id, closingDay: creditCards.closingDay })
    .from(creditCards)
    .where(eq(creditCards.userId, params.userId));
  if (cards.length === 0) return [];

  const cardIds = cards.map((card) => card.id);
  const purchases = await listDashboardCardPurchases({
    userId: params.userId,
    cardIds,
    startYm,
    endYmInclusive: purchasesEndYmInclusive,
  });
  if (purchases.length === 0) return [];

  const categoryRows = await db
    .select({
      purchaseId: creditCardPurchases.id,
      categoryName: sql<string>`coalesce(${categories.name}, 'Crédito')`,
    })
    .from(creditCardPurchases)
    .leftJoin(
      categories,
      and(
        eq(categories.id, creditCardPurchases.categoryId),
        eq(categories.householdId, params.householdId),
      ),
    )
    .where(
      and(
        eq(creditCardPurchases.userId, params.userId),
        inArray(
          creditCardPurchases.id,
          purchases.map((purchase) => purchase.id),
        ),
      ),
    );
  const categoryByPurchaseId = new Map(
    categoryRows.map((row) => [row.purchaseId, String(row.categoryName)]),
  );

  const prepayments = await listDashboardCardPrepayments({
    userId: params.userId,
    purchaseIds: purchases.map((purchase) => purchase.id),
  });

  const prepaymentsByCardId = new Map<string, DashboardCardPrepayment[]>();
  const purchaseCardById = new Map(
    purchases.map((purchase) => [purchase.id, purchase.creditCardId]),
  );
  for (const prepayment of prepayments) {
    const cardId = purchaseCardById.get(prepayment.purchaseId);
    if (!cardId) continue;
    const list = prepaymentsByCardId.get(cardId) ?? [];
    list.push(prepayment);
    prepaymentsByCardId.set(cardId, list);
  }

  const purchasesByCardId = new Map<string, DashboardCardPurchase[]>();
  for (const purchase of purchases) {
    const list = purchasesByCardId.get(purchase.creditCardId) ?? [];
    list.push(purchase);
    purchasesByCardId.set(purchase.creditCardId, list);
  }

  const totalsByCategory = new Map<string, number>();
  for (const card of cards) {
    const purchasesByCard = purchasesByCardId.get(card.id) ?? [];
    if (purchasesByCard.length === 0) continue;

    const cardPrepayments = prepaymentsByCardId.get(card.id) ?? [];
    for (const dashboardMonthLabel of monthLabels) {
      const invoiceYm = resolveInvoiceYmForDashboardMonth({
        dashboardMonthLabel,
        selectedMonthLabel,
        currentDashboardMonthLabel,
        now,
        closingDay: card.closingDay,
      });
      const invoice = buildInvoice({
        creditCardId: card.id,
        ym: invoiceYm,
        purchases: purchasesByCard,
        prepayments: cardPrepayments,
      });
      for (const line of invoice.lines) {
        const categoryName =
          categoryByPurchaseId.get(line.purchaseId) ?? "Crédito";
        totalsByCategory.set(
          categoryName,
          (totalsByCategory.get(categoryName) ?? 0) + line.amountCentsThisYm,
        );
      }
    }
  }

  return Array.from(totalsByCategory.entries())
    .map(([categoryName, expenseCents]) => ({
      categoryName,
      expenseCents,
    }))
    .sort((a, b) => b.expenseCents - a.expenseCents);
}

export const dashboardRepo: DashboardRepo = {
  async getMonthlyTotals(params) {
    return getMonthlyTotals(params);
  },
  async getExpenseByCategory(params) {
    const rows = await getExpenseByCategory(params);
    return rows.map((row) => ({
      categoryName: row.categoryName,
      expenseCents: row.expenseCents,
    }));
  },
  async getCreditCardMonthlyExpenses(params) {
    return getCreditCardMonthlyExpenses(params);
  },
  async getCreditCardExpenseByCategory(params) {
    return getCreditCardExpenseByCategory(params);
  },
};
