import type { TransactionType } from "~/domain/transactions/entity";
import {
  TransactionAccountNotFoundError,
  TransactionCategoryNotFoundError,
} from "~/domain/transactions/errors";
import type { TransactionsRepo } from "~/domain/transactions/ports";

export async function createTransaction(params: {
  transactionsRepo: TransactionsRepo;
  idFactory: () => string;
  userId: string;
  householdId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  description: string;
  amountCents: number;
  occurredAt: Date;
}): Promise<
  | { ok: true; transactionId: string }
  | {
      ok: false;
      error:
        | "ACCOUNT_REQUIRED"
        | "TYPE_INVALID"
        | "DESCRIPTION_REQUIRED"
        | "AMOUNT_INVALID"
        | "DATE_REQUIRED"
        | "ACCOUNT_NOT_FOUND"
        | "CATEGORY_NOT_FOUND";
    }
> {
  const description = params.description.trim();

  if (!params.accountId) return { ok: false, error: "ACCOUNT_REQUIRED" };
  if (params.type !== "income" && params.type !== "expense") return { ok: false, error: "TYPE_INVALID" };
  if (!description) return { ok: false, error: "DESCRIPTION_REQUIRED" };
  if (!Number.isInteger(params.amountCents) || params.amountCents <= 0) {
    return { ok: false, error: "AMOUNT_INVALID" };
  }
  if (!(params.occurredAt instanceof Date) || Number.isNaN(params.occurredAt.getTime())) {
    return { ok: false, error: "DATE_REQUIRED" };
  }

  const id = params.idFactory();

  try {
    await params.transactionsRepo.create({
      id,
      userId: params.userId,
      householdId: params.householdId,
      accountId: params.accountId,
      categoryId: params.categoryId,
      type: params.type,
      description,
      amountCents: params.amountCents,
      occurredAt: params.occurredAt,
    });
    return { ok: true, transactionId: id };
  } catch (err) {
    if (err instanceof TransactionAccountNotFoundError) return { ok: false, error: "ACCOUNT_NOT_FOUND" };
    if (err instanceof TransactionCategoryNotFoundError) return { ok: false, error: "CATEGORY_NOT_FOUND" };
    throw err;
  }
}
