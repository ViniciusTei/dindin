import type { TransactionFilters, TransactionsRepo } from "~/domain/transactions/ports";

export async function listTransactions(params: {
  transactionsRepo: TransactionsRepo;
  userId: string;
  householdId: string;
  filters?: TransactionFilters;
}) {
  return params.transactionsRepo.listByHousehold({
    userId: params.userId,
    householdId: params.householdId,
    filters: params.filters,
  });
}
