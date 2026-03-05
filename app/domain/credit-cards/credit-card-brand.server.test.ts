import { describe, expect, it } from "vitest";

import { detectCreditCardBrand } from "~/lib/credit-card-brand.server";

describe("detectCreditCardBrand", () => {
  it("mapeia visa", () => {
    expect(detectCreditCardBrand("4111111111111111")).toBe("visa");
  });

  it("mapeia mastercard", () => {
    expect(detectCreditCardBrand("5555555555554444")).toBe("mastercard");
  });

  it("normaliza espaços no número", () => {
    expect(detectCreditCardBrand("4111 1111 1111 1111")).toBe("visa");
  });
});
