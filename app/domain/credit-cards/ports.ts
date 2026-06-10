import type {
  CreditCard,
  CreditCardPurchase,
  CreditCardPurchasePrepayment,
} from "~/domain/credit-cards/entity";

export interface CardCrypto {
  encrypt(plaintext: string): string;
  decrypt(payload: string): string;
}

export interface CreditCardsRepo<TTx = never> {
  listByUser(userId: string): Promise<CreditCard[]>;
  findById(params: { userId: string; creditCardId: string; tx?: TTx }): Promise<CreditCard | null>;

  create(params: {
    id: string;
    userId: string;
    accountId: string | null;
    nickname: string;
    numberEnc: string | null;
    expirationEnc: string | null;
    cvvEnc: string | null;
    brand: string | null;
    limitCents: number | null;
    closingDay: number | null;
    dueDay: number | null;
    tx?: TTx;
  }): Promise<void>;

  update(params: {
    userId: string;
    creditCardId: string;
    nickname?: string;
    accountId: string | null;
    limitCents: number | null;
    closingDay?: number | null;
    dueDay?: number | null;
    tx?: TTx;
  }): Promise<void>;

  delete(params: { userId: string; creditCardId: string; tx?: TTx }): Promise<void>;
}

export interface CreditCardPurchasesRepo<TTx = never> {
  listByCard(params: { userId: string; creditCardId: string; tx?: TTx }): Promise<CreditCardPurchase[]>;
  findById(params: { userId: string; purchaseId: string; tx?: TTx }): Promise<CreditCardPurchase | null>;

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
    tx?: TTx;
  }): Promise<void>;

  linkTransaction(params: { userId: string; purchaseId: string; transactionId: string; tx?: TTx }): Promise<void>;
}

export interface CreditCardPrepaymentsRepo<TTx = never> {
  listByCard(params: {
    userId: string;
    creditCardId: string;
    tx?: TTx;
  }): Promise<CreditCardPurchasePrepayment[]>;

  create(params: {
    id: string;
    userId: string;
    purchaseId: string;
    ym: string;
    installmentsCount: number;
    createdAt: Date;
    tx?: TTx;
  }): Promise<void>;
}
