import type { Transaction, TransactionType } from "./entity";

export interface TransactionsRepo {
  listByHousehold(params: { userId: string; householdId: string }): Promise<Transaction[]>;

  create(params: {
    id: string;
    userId: string;
    householdId: string;
    accountId: string;
    categoryId: string | null;
    type: TransactionType;
    description: string;
    amountCents: number;
    occurredAt: Date;
    tx?: unknown;
  }): Promise<void>;

  update(params: {
    userId: string;
    householdId: string;
    transactionId: string;
    accountId: string;
    categoryId: string | null;
    type: TransactionType;
    description: string;
    amountCents: number;
    occurredAt: Date;
    tx?: unknown;
  }): Promise<void>;

  delete(params: { userId: string; householdId: string; transactionId: string; tx?: unknown }): Promise<void>;
}
