import creditCardType from "credit-card-type";

import type { CreditCardBrand } from "~/domain/credit-cards/entity";

export function detectCreditCardBrand(cardNumber: string): CreditCardBrand {
  const normalized = cardNumber.replace(/\s+/g, "").trim();
  if (!normalized) return "unknown";

  const candidates = creditCardType(normalized);
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
