export type Transaction = {
  id: string;
  type: "expense" | "income";
  category: string;
  description: string;
  amount: number;
  date: Date;
  created_at: Date;
  updated_at: Date;
};

export type CreateTransaction = Omit<
  Transaction,
  "id" | "created_at" | "updated_at"
>;
