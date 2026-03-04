import { describe, expect, it } from "vitest";

import { makeCategoriesRepo, makeIdFactory } from "~/domain/test/fakes";
import { createCategory } from "~/domain/categories/usecases/create-category";

describe("createCategory", () => {
  it("valida nome obrigatório", async () => {
    const { repo } = makeCategoriesRepo();

    const result = await createCategory({
      categoriesRepo: repo,
      idFactory: makeIdFactory("cat"),
      householdId: "household-1",
      name: "  ",
    });

    expect(result).toEqual({ ok: false, error: "NAME_REQUIRED" });
  });

  it("falha se já existir", async () => {
    const { repo } = makeCategoriesRepo({ categories: [{ id: "c1", name: "Mercado" }] });

    const result = await createCategory({
      categoriesRepo: repo,
      idFactory: makeIdFactory("cat"),
      householdId: "household-1",
      name: "Mercado",
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });

  it("cria e retorna id", async () => {
    const { repo, categories } = makeCategoriesRepo();

    const result = await createCategory({
      categoriesRepo: repo,
      idFactory: makeIdFactory("cat"),
      householdId: "household-1",
      name: "Mercado",
    });

    expect(result.ok).toBe(true);
    expect(categories).toHaveLength(1);
    expect(categories[0]?.name).toBe("Mercado");
  });
});
