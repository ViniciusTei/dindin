import type { AccountsRepo } from "~/domain/accounts/ports";

export async function listAccounts(params: { accountsRepo: AccountsRepo; userId: string }) {
  return params.accountsRepo.listByUser(params.userId);
}
