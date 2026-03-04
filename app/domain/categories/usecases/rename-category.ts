import { CategoryAlreadyExistsError, CategoryNotFoundError } from "~/domain/categories/errors";
import type { CategoriesRepo } from "~/domain/categories/ports";

export async function renameCategory(params: {
  categoriesRepo: CategoriesRepo;
  householdId: string;
  categoryId: string;
  name: string;
}): Promise<{ ok: true } | { ok: false; error: "NAME_REQUIRED" | "NOT_FOUND" | "ALREADY_EXISTS" }> {
  const name = params.name.trim();
  if (!name) return { ok: false, error: "NAME_REQUIRED" };

  try {
    await params.categoriesRepo.rename({
      householdId: params.householdId,
      categoryId: params.categoryId,
      name,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof CategoryNotFoundError) return { ok: false, error: "NOT_FOUND" };
    if (err instanceof CategoryAlreadyExistsError) return { ok: false, error: "ALREADY_EXISTS" };
    throw err;
  }
}
