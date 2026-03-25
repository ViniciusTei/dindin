export type MembershipRole = "admin" | "member";

export type HouseholdAccess = {
  householdId: string;
  name: string;
  role: MembershipRole;
  createdAt: Date;
};

export type HouseholdExpenseByCategory = {
  categoryName: string;
  expenseCents: number;
};

export type HouseholdExpenseMonth = {
  monthLabel: string;
  expenseCents: number;
};

export type HouseholdMember = {
  userId: string;
  username: string;
  role: MembershipRole;
  createdAt: Date;
  explicitShareBps: number | null;
  effectiveShareBps: number;
};

export type HouseholdSummary = HouseholdAccess & {
  memberCount: number;
  currentMonthExpenseCents: number;
  currentUserEffectiveShareBps: number;
};

export type HouseholdDetails = HouseholdSummary & {
  monthLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  expenseByCategory: HouseholdExpenseByCategory[];
  expenseSeries: HouseholdExpenseMonth[];
  members: HouseholdMember[];
};
