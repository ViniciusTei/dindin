import { AccountNotFoundError } from "~/domain/accounts/errors";
import type { AccountsRepo } from "~/domain/accounts/ports";

export async function deleteAccount(params: {
  accountsRepo: AccountsRepo;
  userId: string;
  accountId: string;
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" | "HAS_TRANSACTIONS" }> {
  const txCount = await params.accountsRepo.countTransactionsByAccount({
    userId: params.userId,
    accountId: params.accountId,
  });

  if (txCount > 0) return { ok: false, error: "HAS_TRANSACTIONS" };

  try {
    await params.accountsRepo.delete({ userId: params.userId, accountId: params.accountId });
    return { ok: true };
  } catch (err) {
    if (err instanceof AccountNotFoundError) return { ok: false, error: "NOT_FOUND" };
    throw err;
  }
}
