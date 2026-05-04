import { describe, expect, it } from "vitest";

import { formatTransactionDate } from "./helpers";

describe("formatTransactionDate", () => {
  it("formats a date as dd/MM/yyyy", () => {
    const date = new Date("2026-03-15T00:00:00.000Z");
    expect(formatTransactionDate(date)).toBe("15/03/2026");
  });

  it("pads single-digit day and month", () => {
    const date = new Date("2026-01-05T00:00:00.000Z");
    expect(formatTransactionDate(date)).toBe("05/01/2026");
  });
});
