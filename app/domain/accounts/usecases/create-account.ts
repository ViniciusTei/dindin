import { AccountAlreadyExistsError } from "~/domain/accounts/errors";
import type { AccountsRepo } from "~/domain/accounts/ports";

export async function createAccount(params: {
  accountsRepo: AccountsRepo;
  idFactory: () => string;
  userId: string;
  name: string;
  initialBalanceCents: number;
}): Promise<
  | { ok: true; accountId: string }
  | { ok: false; error: "NAME_REQUIRED" | "ALREADY_EXISTS" | "INITIAL_BALANCE_INVALID" }
> {
  const name = params.name.trim();
  if (!name) return { ok: false, error: "NAME_REQUIRED" };

  if (!Number.isInteger(params.initialBalanceCents)) {
    return { ok: false, error: "INITIAL_BALANCE_INVALID" };
  }

  const id = params.idFactory();

  try {
    await params.accountsRepo.create({
      id,
      userId: params.userId,
      name,
      initialBalanceCents: params.initialBalanceCents,
    });
    return { ok: true, accountId: id };
  } catch (err) {
    if (err instanceof AccountAlreadyExistsError) return { ok: false, error: "ALREADY_EXISTS" };
    throw err;
  }
}
