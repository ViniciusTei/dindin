import { describe, expect, it } from "vitest";

import type { HouseholdAccess } from "~/domain/households/entity";

import { filterHouseholdOptions } from "./search-household-options";

function makeHousehold(
  overrides: Partial<HouseholdAccess> = {},
): HouseholdAccess {
  return {
    householdId: overrides.householdId ?? "hh_1",
    name: overrides.name ?? "Casa da Maria",
    role: overrides.role ?? "admin",
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("filterHouseholdOptions", () => {
  it("marca a household recomendada quando ela existe na lista", () => {
    const result = filterHouseholdOptions({
      households: [
        makeHousehold({ householdId: "hh_1", name: "Casa da Maria" }),
        makeHousehold({ householdId: "hh_2", name: "Apartamento" }),
      ],
      query: "",
      recommendedHouseholdId: "hh_2",
    });

    expect(result.recommendedHouseholdId).toBe("hh_2");
    expect(result.options[0]?.householdId).toBe("hh_2");
    expect(result.options[0]?.recommended).toBe(true);
  });

  it("filtra por nome ignorando caixa", () => {
    const result = filterHouseholdOptions({
      households: [
        makeHousehold({ householdId: "hh_1", name: "Casa da Maria" }),
        makeHousehold({ householdId: "hh_2", name: "Família Silva" }),
      ],
      query: "fAmÍ",
    });

    expect(result.options).toHaveLength(1);
    expect(result.options[0]?.householdId).toBe("hh_2");
  });

  it("faz fallback para a primeira household quando a recomendada não existe", () => {
    const result = filterHouseholdOptions({
      households: [
        makeHousehold({ householdId: "hh_1", name: "Casa da Maria" }),
        makeHousehold({ householdId: "hh_2", name: "Apartamento" }),
      ],
      query: "",
      recommendedHouseholdId: "hh_inexistente",
    });

    expect(result.recommendedHouseholdId).toBe("hh_1");
    expect(result.options[0]?.householdId).toBe("hh_1");
    expect(result.options[0]?.recommended).toBe(true);
  });
});
