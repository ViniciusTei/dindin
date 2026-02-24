import { describe, expect, it } from "vitest";

import { makeIdFactory, makeMonthsRepo } from "~/domain/test/fakes";

import { createMonth } from "./create-month";

describe("domain/months/createMonth", () => {
  it("valida obrigatoriedade de ano/mês", async () => {
    const { repo: monthsRepo } = makeMonthsRepo();

    const result = await createMonth({
      monthsRepo,
      householdId: "h1",
      year: "",
      month: "",
      idFactory: makeIdFactory(),
    });

    expect(result).toEqual({ ok: false, error: "YEAR_MONTH_REQUIRED" });
  });

  it("valida formato do ano", async () => {
    const { repo: monthsRepo } = makeMonthsRepo();

    const result = await createMonth({
      monthsRepo,
      householdId: "h1",
      year: "26",
      month: "02",
      idFactory: makeIdFactory(),
    });

    expect(result).toEqual({ ok: false, error: "YEAR_INVALID" });
  });

  it("valida formato do mês", async () => {
    const { repo: monthsRepo } = makeMonthsRepo();

    const result = await createMonth({
      monthsRepo,
      householdId: "h1",
      year: "2026",
      month: "13",
      idFactory: makeIdFactory(),
    });

    expect(result).toEqual({ ok: false, error: "MONTH_INVALID" });
  });

  it("cria quando ok", async () => {
    const { repo: monthsRepo } = makeMonthsRepo();

    const result = await createMonth({
      monthsRepo,
      householdId: "h1",
      year: "2026",
      month: "02",
      idFactory: makeIdFactory("month"),
    });

    expect(result).toEqual({ ok: true, monthId: "month-1" });
  });

  it("retorna ALREADY_EXISTS quando repo acusa duplicidade", async () => {
    const { repo: monthsRepo } = makeMonthsRepo();

    await createMonth({
      monthsRepo,
      householdId: "h1",
      year: "2026",
      month: "02",
      idFactory: makeIdFactory("month"),
    });

    const result2 = await createMonth({
      monthsRepo,
      householdId: "h1",
      year: "2026",
      month: "02",
      idFactory: makeIdFactory("month2"),
    });

    expect(result2).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });
});
