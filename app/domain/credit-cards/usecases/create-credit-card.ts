import type { CreditCardBrand } from "~/domain/credit-cards/entity";
import creditCardType from "credit-card-type";

import { CreditCardAccountNotFoundError } from "~/domain/credit-cards/errors";
import type { CardCrypto, CreditCardsRepo } from "~/domain/credit-cards/ports";

function inferBrand(number: string): CreditCardBrand {
  const candidates = creditCardType(number);
  const type = candidates[0]?.type;

  switch (type) {
    case "visa":
      return "visa";
    case "mastercard":
      return "mastercard";
    case "american-express":
      return "amex";
    default:
      return "unknown";
  }
}

function isDigits(value: string): boolean {
  return /^\d+$/.test(value);
}

function normalizeCardNumber(number: string): string {
  return number.replace(/\s+/g, "").trim();
}

function normalizeExpiration(exp: string): string {
  return exp.trim();
}

export async function createCreditCard(params: {
  creditCardsRepo: CreditCardsRepo;
  crypto: CardCrypto;
  idFactory: () => string;
  userId: string;
  accountId: string | null;
  number: string;
  expiration: string;
  cvv?: string | null;
  limitCents: number | null;
  closingDay: number;
  dueDay: number;
}): Promise<
  | { ok: true; creditCardId: string }
  | {
      ok: false;
      error:
        | "NUMBER_REQUIRED"
        | "NUMBER_INVALID"
        | "EXPIRATION_REQUIRED"
        | "EXPIRATION_INVALID"
        | "CVV_INVALID"
        | "LIMIT_INVALID"
        | "CLOSING_DAY_INVALID"
        | "DUE_DAY_INVALID"
        | "ACCOUNT_NOT_FOUND";
    }
> {
  const number = normalizeCardNumber(params.number);
  if (!number) return { ok: false, error: "NUMBER_REQUIRED" };
  if (!isDigits(number) || number.length < 12 || number.length > 19) {
    return { ok: false, error: "NUMBER_INVALID" };
  }

  const expiration = normalizeExpiration(params.expiration);
  if (!expiration) return { ok: false, error: "EXPIRATION_REQUIRED" };
  // MVP: aceita MM/AA ou MM/AAAA
  if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiration)) {
    return { ok: false, error: "EXPIRATION_INVALID" };
  }

  const cvv = (params.cvv ?? null)?.trim() || null;
  if (cvv && (!isDigits(cvv) || cvv.length < 3 || cvv.length > 4)) {
    return { ok: false, error: "CVV_INVALID" };
  }

  if (params.limitCents !== null) {
    if (!Number.isInteger(params.limitCents) || params.limitCents <= 0) {
      return { ok: false, error: "LIMIT_INVALID" };
    }
  }

  if (!Number.isInteger(params.closingDay) || params.closingDay < 1 || params.closingDay > 31) {
    return { ok: false, error: "CLOSING_DAY_INVALID" };
  }
  if (!Number.isInteger(params.dueDay) || params.dueDay < 1 || params.dueDay > 31) {
    return { ok: false, error: "DUE_DAY_INVALID" };
  }

  const id = params.idFactory();
  const brand = inferBrand(number);

  try {
    await params.creditCardsRepo.create({
      id,
      userId: params.userId,
      accountId: params.accountId,
      numberEnc: params.crypto.encrypt(number),
      expirationEnc: params.crypto.encrypt(expiration),
      cvvEnc: cvv ? params.crypto.encrypt(cvv) : null,
      brand,
      limitCents: params.limitCents,
      closingDay: params.closingDay,
      dueDay: params.dueDay,
    });
    return { ok: true, creditCardId: id };
  } catch (err) {
    if (err instanceof CreditCardAccountNotFoundError) {
      return { ok: false, error: "ACCOUNT_NOT_FOUND" };
    }
    throw err;
  }
}
