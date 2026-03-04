import type { Transaction, TransactionType } from "./entity";

export interface TransactionsRepo {
  listByUser(userId: string): Promise<Transaction[]>;

  create(params: {
    id: string;
    userId: string;
    accountId: string;
    categoryId: string | null;
    type: TransactionType;
    description: string;
    amountCents: number;
    occurredAt: Date;
  }): Promise<void>;

  update(params: {
    userId: string;
    transactionId: string;
    accountId: string;
    categoryId: string | null;
    type: TransactionType;
    description: string;
    amountCents: number;
    occurredAt: Date;
  }): Promise<void>;

  delete(params: { userId: string; transactionId: string }): Promise<void>;
}
