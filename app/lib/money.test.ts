import { describe, expect, it } from "vitest";

import { amountColorClass } from "./money";

describe("amountColorClass", () => {
  it("returns text-success for positive values", () => {
    expect(amountColorClass(1000)).toBe("text-success");
  });

  it("returns text-error for negative values", () => {
    expect(amountColorClass(-1000)).toBe("text-error");
  });

  it("returns text-base-content for zero", () => {
    expect(amountColorClass(0)).toBe("text-base-content");
  });
});
