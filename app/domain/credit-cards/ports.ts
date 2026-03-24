import type {
  CreditCard,
  CreditCardPurchase,
  CreditCardPurchasePrepayment,
} from "~/domain/credit-cards/entity";

export interface CardCrypto {
  encrypt(plaintext: string): string;
  decrypt(payload: string): string;
}

export interface CreditCardsRepo {
  listByUser(userId: string): Promise<CreditCard[]>;
  findById(params: { userId: string; creditCardId: string }): Promise<CreditCard | null>;

  create(params: {
    id: string;
    userId: string;
    accountId: string | null;
    numberEnc: string;
    expirationEnc: string;
    cvvEnc: string | null;
    brand: string;
    limitCents: number | null;
    closingDay: number;
    dueDay: number;
  }): Promise<void>;

  update(params: {
    userId: string;
    creditCardId: string;
    accountId: string | null;
    limitCents: number | null;
    closingDay: number;
    dueDay: number;
  }): Promise<void>;

  delete(params: { userId: string; creditCardId: string }): Promise<void>;
}

export interface CreditCardPurchasesRepo {
  listByCard(params: { userId: string; creditCardId: string }): Promise<CreditCardPurchase[]>;
  findById(params: { userId: string; purchaseId: string }): Promise<CreditCardPurchase | null>;

  create(params: {
    id: string;
    userId: string;
    creditCardId: string;
    categoryId: string | null;
    description: string;
    amountCents: number;
    occurredAt: Date;
    installmentsTotal: number;
    firstInvoiceYm: string;
  }): Promise<void>;

  linkTransaction(params: { userId: string; purchaseId: string; transactionId: string }): Promise<void>;
}

export interface CreditCardPrepaymentsRepo {
  listByCard(params: {
    userId: string;
    creditCardId: string;
  }): Promise<CreditCardPurchasePrepayment[]>;

  create(params: {
    id: string;
    userId: string;
    purchaseId: string;
    ym: string;
    installmentsCount: number;
    createdAt: Date;
  }): Promise<void>;
}
