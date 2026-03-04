import type { TransactionsRepo } from "~/domain/transactions/ports";

export async function listTransactions(params: {
  transactionsRepo: TransactionsRepo;
  userId: string;
}) {
  return params.transactionsRepo.listByUser(params.userId);
}
