import { TransactionNotFoundError } from "~/domain/transactions/errors";
import type { TransactionsRepo } from "~/domain/transactions/ports";

export async function deleteTransaction(params: {
  transactionsRepo: TransactionsRepo;
  userId: string;
  householdId: string;
  transactionId: string;
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" }> {
  try {
    await params.transactionsRepo.delete({
      userId: params.userId,
      householdId: params.householdId,
      transactionId: params.transactionId,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof TransactionNotFoundError) return { ok: false, error: "NOT_FOUND" };
    throw err;
  }
}
