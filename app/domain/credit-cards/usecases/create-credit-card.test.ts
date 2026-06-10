import { describe, expect, it } from "vitest";

import { createCreditCard } from "~/domain/credit-cards/usecases/create-credit-card";
import { makeCardCrypto, makeCreditCardsRepo, makeIdFactory } from "~/domain/test/fakes";

describe("createCreditCard", () => {
  it("valida nickname obrigatório", async () => {
    const { repo } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      nickname: "   ",
    });

    expect(result).toEqual({ ok: false, error: "NICKNAME_REQUIRED" });
  });

  it("valida número se informado", async () => {
    const { repo } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      nickname: "Meu cartão",
      number: "123",
    });

    expect(result).toEqual({ ok: false, error: "NUMBER_INVALID" });
  });

  it("valida expiration se informada", async () => {
    const { repo } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      nickname: "Meu cartão",
      expiration: "13/26",
    });

    expect(result).toEqual({ ok: false, error: "EXPIRATION_INVALID" });
  });

  it("valida CVV se informado", async () => {
    const { repo } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      nickname: "Meu cartão",
      cvv: "12",
    });

    expect(result).toEqual({ ok: false, error: "CVV_INVALID" });
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
      nickname: "Meu cartão",
    });

    expect(result).toEqual({ ok: false, error: "ACCOUNT_NOT_FOUND" });
  });

  it("cria cartão apenas com nickname", async () => {
    const { repo, cards } = makeCreditCardsRepo();

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto(),
      detectBrand: () => "unknown",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: null,
      nickname: "Meu cartão",
    });

    expect(result.ok).toBe(true);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.nickname).toBe("Meu cartão");
    expect(cards[0]?.numberEnc).toBeNull();
    expect(cards[0]?.expirationEnc).toBeNull();
    expect(cards[0]?.cvvEnc).toBeNull();
    expect(cards[0]?.brand).toBeNull();
    expect(cards[0]?.limitCents).toBeNull();
    expect(cards[0]?.closingDay).toBeNull();
    expect(cards[0]?.dueDay).toBeNull();
  });

  it("cria cartão completo e criptografa campos", async () => {
    const { repo, cards } = makeCreditCardsRepo({ accountIds: ["acc-1"] });

    const result = await createCreditCard({
      creditCardsRepo: repo,
      crypto: makeCardCrypto("enc"),
      detectBrand: () => "visa",
      idFactory: makeIdFactory("cc"),
      userId: "user-1",
      accountId: "acc-1",
      nickname: "Meu cartão Visa",
      number: "4111111111111111",
      expiration: "03/26",
      cvv: "123",
      limitCents: 100_00,
      closingDay: 10,
      dueDay: 15,
    });

    expect(result.ok).toBe(true);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.nickname).toBe("Meu cartão Visa");
    expect(cards[0]?.numberEnc?.startsWith("enc:")).toBe(true);
    expect(cards[0]?.expirationEnc?.startsWith("enc:")).toBe(true);
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
      nickname: "Meu cartão Amex",
      number: "378282246310005",
      expiration: "03/26",
    });

    expect(result.ok).toBe(true);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.brand).toBe("amex");
  });
});
