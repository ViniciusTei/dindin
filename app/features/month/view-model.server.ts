import { computeDueByIncome } from "~/domain/calc";
import { getMonthDetailReadModel } from "~/db/repositories/month.repo.server";

export type MonthDetailMember = { userId: string; role: string; username: string };
export type MonthDetailMonth = { id: string; ym: string; status: "open" | "closed" };
export type MonthDetailCategory = { id: string; name: string };
export type MonthDetailExpense = {
  id: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  isPaid: boolean;
};
export type MonthDetailTransfer = {
  id: string;
  fromUserId: string;
  toUserId: string;
  amountCents: number;
  completedAt: Date | null;
};

export type MonthDetailLoaderData = {
  month: MonthDetailMonth;
  members: MonthDetailMember[];
  adminUserId: string | null;
  incomes: Record<string, number | null>;
  categories: MonthDetailCategory[];
  expenses: MonthDetailExpense[];
  totalExpenseCents: number;
  dues: Array<{ userId: string; dueCents: number }>;
  transfers: MonthDetailTransfer[];
};

export async function getMonthDetailLoaderData(params: {
  monthId: string;
  householdId: string;
}): Promise<MonthDetailLoaderData> {
  const rm = await getMonthDetailReadModel({
    monthId: params.monthId,
    householdId: params.householdId,
  });

  if (!rm) throw new Response("Mês não encontrado", { status: 404 });

  const admin = rm.members.find((m) => m.role === "admin");
  const adminUserId = admin?.userId ?? rm.members[0]?.userId ?? null;
  const memberUserIds = rm.members.map((m) => m.userId);

  const incomeByUser = new Map(rm.incomes.map((r) => [r.userId, r.amountCents] as const));
  const incomes = Object.fromEntries(
    rm.members.map((m) => [m.userId, incomeByUser.get(m.userId) ?? null])
  ) as Record<string, number | null>;

  const expenses = rm.expenses.map((e) => ({
    id: e.id,
    categoryId: e.categoryId,
    description: e.description,
    amountCents: e.amountCents,
    isPaid: e.isPaid,
  }));

  const totalExpenseCents = expenses.reduce((acc, e) => acc + e.amountCents, 0);

  const dues = computeDueByIncome({
    members: rm.members.map((m) => ({
      userId: m.userId,
      incomeCents: incomeByUser.get(m.userId) ?? 0,
    })),
    totalExpenseCents,
  });

  return {
    month: { id: rm.month.id, ym: rm.month.ym, status: rm.month.status === "closed" ? "closed" : "open" },
    members: rm.members,
    adminUserId,
    incomes,
    categories: rm.categories.map((c) => ({ id: c.id, name: c.name })),
    expenses,
    totalExpenseCents,
    dues,
    transfers: rm.transfers.map((t) => ({
      id: t.id,
      fromUserId: t.fromUserId,
      toUserId: t.toUserId,
      amountCents: t.amountCents,
      completedAt: t.completedAt,
    })),
  };
}

export async function getMonthExportCsvModel(params: {
  monthId: string;
  householdId: string;
}) {
  const rm = await getMonthDetailReadModel({
    monthId: params.monthId,
    householdId: params.householdId,
    expenseOrder: "asc",
  });

  if (!rm) throw new Response("Mês não encontrado", { status: 404 });

  return {
    month: rm.month,
    members: rm.members,
    incomes: rm.incomes,
    categories: rm.categories,
    expenses: rm.expenses,
    transfers: rm.transfers,
  };
}
