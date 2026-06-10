import type { CreditCardBrand } from "~/domain/credit-cards/entity";

import { CreditCardAccountNotFoundError } from "~/domain/credit-cards/errors";
import type { CardCrypto, CreditCardsRepo } from "~/domain/credit-cards/ports";

export type DetectCreditCardBrand = (number: string) => CreditCardBrand;

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
  detectBrand: DetectCreditCardBrand;
  idFactory: () => string;
  userId: string;
  accountId: string | null;
  nickname: string;
  number?: string | null;
  expiration?: string | null;
  cvv?: string | null;
  limitCents?: number | null;
  closingDay?: number | null;
  dueDay?: number | null;
}): Promise<
  | { ok: true; creditCardId: string }
  | {
      ok: false;
      error:
        | "NICKNAME_REQUIRED"
        | "NUMBER_INVALID"
        | "EXPIRATION_INVALID"
        | "CVV_INVALID"
        | "LIMIT_INVALID"
        | "CLOSING_DAY_INVALID"
        | "DUE_DAY_INVALID"
        | "ACCOUNT_NOT_FOUND";
    }
> {
  const nickname = params.nickname.trim();
  if (!nickname) return { ok: false, error: "NICKNAME_REQUIRED" };

  let numberEnc: string | null = null;
  if (params.number) {
    const number = normalizeCardNumber(params.number);
    if (!isDigits(number) || number.length < 12 || number.length > 19) {
      return { ok: false, error: "NUMBER_INVALID" };
    }
    numberEnc = params.crypto.encrypt(number);
  }

  let expirationEnc: string | null = null;
  if (params.expiration) {
    const expiration = normalizeExpiration(params.expiration);
    if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiration)) {
      return { ok: false, error: "EXPIRATION_INVALID" };
    }
    expirationEnc = params.crypto.encrypt(expiration);
  }

  const cvv = params.cvv?.trim() || null;
  if (cvv && (!isDigits(cvv) || cvv.length < 3 || cvv.length > 4)) {
    return { ok: false, error: "CVV_INVALID" };
  }

  if (params.limitCents != null) {
    if (!Number.isInteger(params.limitCents) || params.limitCents <= 0) {
      return { ok: false, error: "LIMIT_INVALID" };
    }
  }

  if (params.closingDay != null) {
    if (!Number.isInteger(params.closingDay) || params.closingDay < 1 || params.closingDay > 31) {
      return { ok: false, error: "CLOSING_DAY_INVALID" };
    }
  }
  if (params.dueDay != null) {
    if (!Number.isInteger(params.dueDay) || params.dueDay < 1 || params.dueDay > 31) {
      return { ok: false, error: "DUE_DAY_INVALID" };
    }
  }

  const id = params.idFactory();
  const brand = params.number ? params.detectBrand(params.number) : null;

  try {
    await params.creditCardsRepo.create({
      id,
      userId: params.userId,
      accountId: params.accountId,
      nickname,
      numberEnc,
      expirationEnc,
      cvvEnc: cvv ? params.crypto.encrypt(cvv) : null,
      brand,
      limitCents: params.limitCents ?? null,
      closingDay: params.closingDay ?? null,
      dueDay: params.dueDay ?? null,
    });
    return { ok: true, creditCardId: id };
  } catch (err) {
    if (err instanceof CreditCardAccountNotFoundError) {
      return { ok: false, error: "ACCOUNT_NOT_FOUND" };
    }
    throw err;
  }
}
