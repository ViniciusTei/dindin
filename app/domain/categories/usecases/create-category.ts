import { CategoryAlreadyExistsError } from "~/domain/categories/errors";
import type { CategoriesRepo } from "~/domain/categories/ports";

export async function createCategory(params: {
  categoriesRepo: CategoriesRepo;
  idFactory: () => string;
  householdId: string;
  name: string;
}): Promise<{ ok: true; categoryId: string } | { ok: false; error: "NAME_REQUIRED" | "ALREADY_EXISTS" }> {
  const name = params.name.trim();
  if (!name) return { ok: false, error: "NAME_REQUIRED" };

  const id = params.idFactory();
  try {
    await params.categoriesRepo.create({ id, householdId: params.householdId, name });
    return { ok: true, categoryId: id };
  } catch (err) {
    if (err instanceof CategoryAlreadyExistsError) return { ok: false, error: "ALREADY_EXISTS" };
    throw err;
  }
}
