import type { TransactionsRepo } from "~/domain/transactions/ports";

export async function listTransactions(params: {
  transactionsRepo: TransactionsRepo;
  userId: string;
  householdId: string;
}) {
  return params.transactionsRepo.listByHousehold({
    userId: params.userId,
    householdId: params.householdId,
  });
}
