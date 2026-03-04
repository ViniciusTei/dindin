import { describe, expect, it } from "vitest";

import { makeCategoriesRepo } from "~/domain/test/fakes";
import { renameCategory } from "~/domain/categories/usecases/rename-category";

describe("renameCategory", () => {
  it("valida nome obrigatório", async () => {
    const { repo } = makeCategoriesRepo({ categories: [{ id: "c1", name: "Mercado" }] });

    const result = await renameCategory({
      categoriesRepo: repo,
      householdId: "household-1",
      categoryId: "c1",
      name: " ",
    });

    expect(result).toEqual({ ok: false, error: "NAME_REQUIRED" });
  });

  it("falha se não existir", async () => {
    const { repo } = makeCategoriesRepo();

    const result = await renameCategory({
      categoriesRepo: repo,
      householdId: "household-1",
      categoryId: "missing",
      name: "Nova",
    });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("falha se já existir outro com mesmo nome", async () => {
    const { repo } = makeCategoriesRepo({
      categories: [
        { id: "c1", name: "Mercado" },
        { id: "c2", name: "Aluguel" },
      ],
    });

    const result = await renameCategory({
      categoriesRepo: repo,
      householdId: "household-1",
      categoryId: "c1",
      name: "Aluguel",
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });

  it("renomeia", async () => {
    const { repo, categories } = makeCategoriesRepo({ categories: [{ id: "c1", name: "Mercado" }] });

    const result = await renameCategory({
      categoriesRepo: repo,
      householdId: "household-1",
      categoryId: "c1",
      name: "Mercado (super)" ,
    });

    expect(result).toEqual({ ok: true });
    expect(categories[0]?.name).toBe("Mercado (super)");
  });
});
