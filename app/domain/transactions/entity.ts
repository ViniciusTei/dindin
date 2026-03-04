export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  description: string;
  amountCents: number;
  occurredAt: Date;
  createdAt: Date;
};
