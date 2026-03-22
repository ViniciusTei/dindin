import { describe, expect, it } from "vitest";

import {
  isValidDashboardMonthLabel,
  monthLabelUTC,
  monthStartFromLabel,
  monthStartUTC,
  resolveDashboardMonthLabel,
  shiftDashboardMonthLabel,
} from "~/domain/dashboard/month";

describe("domain/dashboard/month", () => {
  it("resolve mês solicitado válido", () => {
    expect(
      resolveDashboardMonthLabel({
        requestedMonthLabel: "2026-05",
        now: new Date("2026-03-22T00:00:00.000Z"),
      }),
    ).toBe("2026-05");
  });

  it("cai para o mês atual quando o valor é inválido", () => {
    expect(
      resolveDashboardMonthLabel({
        requestedMonthLabel: "2026-13",
        now: new Date("2026-03-22T00:00:00.000Z"),
      }),
    ).toBe("2026-03");
  });

  it("desloca mês para anterior e próximo", () => {
    expect(shiftDashboardMonthLabel("2026-01", -1)).toBe("2025-12");
    expect(shiftDashboardMonthLabel("2026-12", 1)).toBe("2027-01");
  });

  it("converte label para início do mês em utc", () => {
    expect(monthStartFromLabel("2026-04").toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(monthLabelUTC(monthStartUTC(new Date("2026-04-19T10:20:30.000Z")))).toBe("2026-04");
  });

  it("valida formato yyyy-mm", () => {
    expect(isValidDashboardMonthLabel("2026-03")).toBe(true);
    expect(isValidDashboardMonthLabel("2026-3")).toBe(false);
    expect(isValidDashboardMonthLabel("2026-13")).toBe(false);
  });
});
