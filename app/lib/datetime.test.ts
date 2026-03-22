import { describe, expect, it } from "vitest";

import { dateFormatter, formatDate } from "~/lib/datetime";

describe("lib/datetime", () => {
  it("mantém compatibilidade da API legada em formato curto", () => {
    expect(formatDate("2026-03-22")).toBe("22/03/2026");
  });

  it("mantém compatibilidade da API legada para formato longo sem dia", () => {
    expect(formatDate("2026-03-22", { format: "long", exclude: ["day"] })).toBe("março de 2026");
  });

  it("builder permite composição encadeável", () => {
    const value = dateFormatter("2026-03-22").long().withoutDay().build();
    expect(value).toBe("março de 2026");
  });

  it("builder é imutável entre chamadas", () => {
    const base = dateFormatter("2026-03-22");
    const long = base.long();

    expect(base.build()).toBe("22/03/2026");
    expect(long.build()).toBe("22 de março de 2026");
  });

  it("retorna input original quando data é inválida", () => {
    expect(formatDate("invalid-date")).toBe("invalid-date");
    expect(dateFormatter("invalid-date").long().build()).toBe("invalid-date");
  });
});
