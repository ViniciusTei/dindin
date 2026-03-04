import { describe, expect, it } from "vitest";

import { makeCategoriesRepo } from "~/domain/test/fakes";
import { deleteCategory } from "~/domain/categories/usecases/delete-category";

describe("deleteCategory", () => {
  it("falha se não existir", async () => {
    const { repo } = makeCategoriesRepo();

    const result = await deleteCategory({
      categoriesRepo: repo,
      householdId: "household-1",
      categoryId: "missing",
    });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("remove", async () => {
    const { repo, categories } = makeCategoriesRepo({ categories: [{ id: "c1", name: "Mercado" }] });

    const result = await deleteCategory({
      categoriesRepo: repo,
      householdId: "household-1",
      categoryId: "c1",
    });

    expect(result).toEqual({ ok: true });
    expect(categories).toHaveLength(0);
  });
});
