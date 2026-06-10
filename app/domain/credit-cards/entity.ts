export type CreditCardBrand = "visa" | "mastercard" | "amex" | "unknown";

export type CreditCard = {
  id: string;
  userId: string;
  accountId: string | null;
  nickname: string;
  numberEnc: string | null;
  expirationEnc: string | null;
  cvvEnc: string | null;
  brand: CreditCardBrand | null;
  limitCents: number | null;
  closingDay: number | null;
  dueDay: number | null;
  createdAt: Date;
};

export type CreditCardPurchase = {
  id: string;
  userId: string;
  creditCardId: string;
  categoryId: string | null;
  description: string;
  amountCents: number;
  occurredAt: Date;
  installmentsTotal: number;
  firstInvoiceYm: string; // YYYY-MM
  createdAt: Date;
};

export type CreditCardPurchasePrepayment = {
  id: string;
  userId: string;
  purchaseId: string;
  ym: string; // YYYY-MM
  installmentsCount: number;
  createdAt: Date;
};

export type CreditCardInvoiceLine = {
  purchaseId: string;
  description: string;
  occurredAt: Date;
  installments: {
    total: number;
    billedThisYm: number;
  };
  amountCentsThisYm: number;
};

export type CreditCardInvoice = {
  creditCardId: string;
  ym: string;
  totalCents: number;
  lines: CreditCardInvoiceLine[];
};
