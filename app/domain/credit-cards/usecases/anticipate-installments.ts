import { CreditCardPurchaseNotFoundError } from "~/domain/credit-cards/errors";
import { isValidYm } from "~/domain/credit-cards/invoice";
import type {
  CreditCardPrepaymentsRepo,
  CreditCardPurchasesRepo,
} from "~/domain/credit-cards/ports";

export async function anticipateInstallments(params: {
  purchasesRepo: CreditCardPurchasesRepo;
  prepaymentsRepo: CreditCardPrepaymentsRepo;
  idFactory: () => string;
  now: () => Date;
  userId: string;
  purchaseId: string;
  ym: string;
  installmentsCount: number;
}): Promise<
  | { ok: true; prepaymentId: string }
  | {
      ok: false;
      error:
        | "PURCHASE_REQUIRED"
        | "PURCHASE_NOT_FOUND"
        | "YM_INVALID"
        | "COUNT_INVALID";
    }
> {
  if (!params.purchaseId) return { ok: false, error: "PURCHASE_REQUIRED" };
  if (!isValidYm(params.ym)) return { ok: false, error: "YM_INVALID" };
  if (!Number.isInteger(params.installmentsCount) || params.installmentsCount <= 0) {
    return { ok: false, error: "COUNT_INVALID" };
  }

  const purchase = await params.purchasesRepo.findById({
    userId: params.userId,
    purchaseId: params.purchaseId,
  });
  if (!purchase) return { ok: false, error: "PURCHASE_NOT_FOUND" };

  const id = params.idFactory();

  try {
    await params.prepaymentsRepo.create({
      id,
      userId: params.userId,
      purchaseId: purchase.id,
      ym: params.ym,
      installmentsCount: params.installmentsCount,
      createdAt: params.now(),
    });
    return { ok: true, prepaymentId: id };
  } catch (err) {
    if (err instanceof CreditCardPurchaseNotFoundError) {
      return { ok: false, error: "PURCHASE_NOT_FOUND" };
    }
    throw err;
  }
}
