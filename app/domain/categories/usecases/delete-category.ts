import { CategoryNotFoundError } from "~/domain/categories/errors";
import type { CategoriesRepo } from "~/domain/categories/ports";

export async function deleteCategory(params: {
  categoriesRepo: CategoriesRepo;
  householdId: string;
  categoryId: string;
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" }> {
  try {
    await params.categoriesRepo.delete({
      householdId: params.householdId,
      categoryId: params.categoryId,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof CategoryNotFoundError) return { ok: false, error: "NOT_FOUND" };
    throw err;
  }
}
