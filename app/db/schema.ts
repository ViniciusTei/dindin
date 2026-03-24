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

export const householdPaymentShares = pgTable(
  "household_payment_shares",
  {
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    shareBps: integer("share_bps").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.householdId, table.userId] }),
    householdIdx: index("household_payment_shares_household_id_idx").on(
      table.householdId
    ),
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
    householdId: text("household_id")
      .notNull()
      .references(() => households.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
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
    householdIdx: index("transactions_household_id_idx").on(table.householdId),
    accountIdx: index("transactions_account_id_idx").on(table.accountId),
    categoryIdx: index("transactions_category_id_idx").on(table.categoryId),
    occurredAtIdx: index("transactions_occurred_at_idx").on(table.occurredAt),
  })
);

export const creditCards = pgTable(
  "credit_cards",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").references(() => accounts.id),
    numberEnc: text("number_enc").notNull(),
    expirationEnc: text("expiration_enc").notNull(),
    cvvEnc: text("cvv_enc"),
    brand: text("brand").notNull(),
    limitCents: integer("limit_cents"),
    closingDay: integer("closing_day").notNull(),
    dueDay: integer("due_day").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("credit_cards_user_id_idx").on(table.userId),
    accountIdx: index("credit_cards_account_id_idx").on(table.accountId),
  })
);

export const creditCardPurchases = pgTable(
  "credit_card_purchases",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    creditCardId: text("credit_card_id")
      .notNull()
      .references(() => creditCards.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    amountCents: integer("amount_cents").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    installmentsTotal: integer("installments_total").notNull().default(1),
    firstInvoiceYm: text("first_invoice_ym").notNull(), // YYYY-MM
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("credit_card_purchases_user_id_idx").on(table.userId),
    cardIdx: index("credit_card_purchases_card_id_idx").on(table.creditCardId),
    occurredAtIdx: index("credit_card_purchases_occurred_at_idx").on(table.occurredAt),
    categoryIdx: index("credit_card_purchases_category_id_idx").on(table.categoryId),
    firstInvoiceYmIdx: index("credit_card_purchases_first_invoice_ym_idx").on(table.firstInvoiceYm),
  })
);

export const creditCardPurchasePrepayments = pgTable(
  "credit_card_purchase_prepayments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    purchaseId: text("purchase_id")
      .notNull()
      .references(() => creditCardPurchases.id, { onDelete: "cascade" }),
    ym: text("ym").notNull(), // YYYY-MM (mês em que antecipou)
    installmentsCount: integer("installments_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("credit_card_purchase_prepayments_user_id_idx").on(table.userId),
    purchaseIdx: index("credit_card_purchase_prepayments_purchase_id_idx").on(table.purchaseId),
    ymIdx: index("credit_card_purchase_prepayments_ym_idx").on(table.ym),
  })
);

export const creditCardPurchaseTransactions = pgTable(
  "credit_card_purchase_transactions",
  {
    id: text("id").primaryKey(),
    purchaseId: text("purchase_id")
      .notNull()
      .references(() => creditCardPurchases.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    purchaseIdx: index("credit_card_purchase_transactions_purchase_id_idx").on(table.purchaseId),
    transactionIdx: index("credit_card_purchase_transactions_transaction_id_idx").on(table.transactionId),
  })
);

export type User = typeof users.$inferSelect;
export type Household = typeof households.$inferSelect;
export type Month = typeof months.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type CreditCard = typeof creditCards.$inferSelect;
export type CreditCardPurchase = typeof creditCardPurchases.$inferSelect;
export type HouseholdPaymentShare = typeof householdPaymentShares.$inferSelect;
export type CreditCardPurchasePrepayment =
  typeof creditCardPurchasePrepayments.$inferSelect;
export type CreditCardPurchaseTransaction =
  typeof creditCardPurchaseTransactions.$inferSelect;
