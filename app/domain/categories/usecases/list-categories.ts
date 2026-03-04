import type { CategoriesRepo } from "~/domain/categories/ports";

export async function listCategories(params: {
  categoriesRepo: CategoriesRepo;
  householdId: string;
}) {
  return params.categoriesRepo.listByHousehold(params.householdId);
}
