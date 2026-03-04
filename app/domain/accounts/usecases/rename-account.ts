import { AccountAlreadyExistsError, AccountNotFoundError } from "~/domain/accounts/errors";
import type { AccountsRepo } from "~/domain/accounts/ports";

export async function renameAccount(params: {
  accountsRepo: AccountsRepo;
  userId: string;
  accountId: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; error: "NAME_REQUIRED" | "NOT_FOUND" | "ALREADY_EXISTS" }> {
  const name = params.name.trim();
  if (!name) return { ok: false, error: "NAME_REQUIRED" };

  try {
    await params.accountsRepo.rename({ userId: params.userId, accountId: params.accountId, name });
    return { ok: true };
  } catch (err) {
    if (err instanceof AccountNotFoundError) return { ok: false, error: "NOT_FOUND" };
    if (err instanceof AccountAlreadyExistsError) return { ok: false, error: "ALREADY_EXISTS" };
    throw err;
  }
}
