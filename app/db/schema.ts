import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    isAdmin: boolean("is_admin").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    usernameUq: uniqueIndex("users_username_uq").on(table.username),
  })
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
  })
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    initialBalanceCents: integer("initial_balance_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
    userNameUq: uniqueIndex("accounts_user_name_uq").on(table.userId, table.name),
  })
);

export const households = pgTable(
  "households",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("households_created_at_idx").on(table.createdAt),
  })
);

export const memberships = pgTable(
  "memberships",
  {
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "admin" | "member"
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.householdId, table.userId] }),
    householdIdx: index("memberships_household_id_idx").on(table.householdId),
  })
);

export const months = pgTable(
  "months",
  {
    id: text("id").primaryKey(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    ym: text("ym").notNull(), // YYYY-MM
    status: text("status").notNull().default("open"), // open | closed
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    householdIdx: index("months_household_id_idx").on(table.householdId),
    ymUq: uniqueIndex("months_household_ym_uq").on(table.householdId, table.ym),
  })
);

export const incomes = pgTable(
  "incomes",
  {
    id: text("id").primaryKey(),
    monthId: text("month_id")
      .notNull()
      .references(() => months.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    monthUserUq: uniqueIndex("incomes_month_user_uq").on(
      table.monthId,
      table.userId
    ),
    monthIdx: index("incomes_month_id_idx").on(table.monthId),
  })
);

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    householdNameUq: uniqueIndex("categories_household_name_uq").on(
      table.householdId,
      table.name
    ),
    householdIdx: index("categories_household_id_idx").on(table.householdId),
  })
);

export const expenses = pgTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    monthId: text("month_id")
      .notNull()
      .references(() => months.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    expenseDate: timestamp("expense_date", { withTimezone: true }),
    isPaid: boolean("is_paid").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    monthIdx: index("expenses_month_id_idx").on(table.monthId),
    categoryIdx: index("expenses_category_id_idx").on(table.categoryId),
  })
);

export const inviteLinks = pgTable(
  "invite_links",
  {
    id: text("id").primaryKey(),
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tokenHashUq: uniqueIndex("invite_links_token_hash_uq").on(table.tokenHash),
    householdIdx: index("invite_links_household_id_idx").on(table.householdId),
  })
);

export const transfers = pgTable(
  "transfers",
  {
    id: text("id").primaryKey(),
    monthId: text("month_id")
      .notNull()
      .references(() => months.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    monthIdx: index("transfers_month_id_idx").on(table.monthId),
    fromIdx: index("transfers_from_user_id_idx").on(table.fromUserId),
    toIdx: index("transfers_to_user_id_idx").on(table.toUserId),
  })
);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    type: text("type").notNull(), // income | expense
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("transactions_user_id_idx").on(table.userId),
    accountIdx: index("transactions_account_id_idx").on(table.accountId),
    occurredAtIdx: index("transactions_occurred_at_idx").on(table.occurredAt),
  })
);

export type User = typeof users.$inferSelect;
export type Household = typeof households.$inferSelect;
export type Month = typeof months.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
