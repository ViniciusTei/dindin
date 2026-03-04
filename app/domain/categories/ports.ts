import type { Category } from "./entity";

export interface CategoriesRepo {
  listByHousehold(householdId: string): Promise<Category[]>;

  create(params: {
    id: string;
    householdId: string;
    name: string;
  }): Promise<void>;

  rename(params: {
    householdId: string;
    categoryId: string;
    name: string;
  }): Promise<void>;

  delete(params: { householdId: string; categoryId: string }): Promise<void>;
}
