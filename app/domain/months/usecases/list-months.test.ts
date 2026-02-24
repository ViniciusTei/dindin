import { describe, expect, it } from "vitest";

import { makeMonthsRepo } from "~/domain/test/fakes";

import { listMonths } from "./list-months";

describe("domain/months/listMonths", () => {
  it("lista meses do household", async () => {
    const { repo: monthsRepo } = makeMonthsRepo();
    await monthsRepo.create({ id: "m1", householdId: "h1", ym: "2026-01" as any });
    await monthsRepo.create({ id: "m2", householdId: "h1", ym: "2026-02" as any });
    await monthsRepo.create({ id: "m3", householdId: "h2", ym: "2026-02" as any });

    const list = await listMonths({ monthsRepo, householdId: "h1" });
    expect(list.map((m) => m.id)).toEqual(["m1", "m2"]);
  });
});
