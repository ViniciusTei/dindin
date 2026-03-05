import { describe, expect, it } from "vitest";

import { createCreditCard } from "~/domain/credit-cards/usecases/create-credit-card";
import { makeCardCrypto, makeCreditCardsRepo, makeIdFactory } from "~/domain/test/fakes";

describe("createCreditCard", () => {
  it("valida número obrigatório", async () => {
    const { repo } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      number: "   ",
      expiration: "03/26",
      cvv: null,
      limitCents: null,
      closingDay: 10,
      dueDay: 15,
    });

    expect(result).toEqual({ ok: false, error: "NUMBER_REQUIRED" });
  });

  it("valida data de validade", async () => {
    const { repo } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      number: "4111111111111111",
      expiration: "13/26",
      cvv: null,
      limitCents: null,
      closingDay: 10,
      dueDay: 15,
    });

    expect(result).toEqual({ ok: false, error: "EXPIRATION_INVALID" });
  });

  it("falha se account não existir", async () => {
    const { repo } = makeCreditCardsRepo({ accountIds: ["acc-1"] });

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: "acc-999",
      number: "4111111111111111",
      expiration: "03/26",
      cvv: null,
      limitCents: null,
      closingDay: 10,
      dueDay: 15,
    });

    expect(result).toEqual({ ok: false, error: "ACCOUNT_NOT_FOUND" });
  });

  it("cria cartão e criptografa campos", async () => {
    const { repo, cards } = makeCreditCardsRepo({ accountIds: ["acc-1"] });

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto("enc"),
      detectBrand: () => "visa",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: "acc-1",
      number: "4111111111111111",
      expiration: "03/26",
      cvv: "123",
      limitCents: 100_00,
      closingDay: 10,
      dueDay: 15,
    });

    expect(result.ok).toBe(true);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.numberEnc.startsWith("enc:")).toBe(true);
    expect(cards[0]?.expirationEnc.startsWith("enc:")).toBe(true);
    expect(cards[0]?.cvvEnc?.startsWith("enc:")).toBe(true);
  });

  it("salva a bandeira retornada pelo detector", async () => {
    const { repo, cards } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto("enc"),
      detectBrand: () => "amex",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      number: "378282246310005",
      expiration: "03/26",
      cvv: null,
      limitCents: null,
      closingDay: 10,
      dueDay: 15,
    });

    expect(result.ok).toBe(true);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe("amex");
  });
});
