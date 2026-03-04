import { and, eq } from "drizzle-orm";

import { db } from "~/db/db.server";
import { categories } from "~/db/schema";
import {
  CategoryAlreadyExistsError,
  CategoryNotFoundError,
} from "~/domain/categories/errors";
import type { CategoriesRepo } from "~/domain/categories/ports";

export const categoriesRepo: CategoriesRepo = {
  async listByHousehold(householdId) {
    const rows = await db.query.categories.findMany({
      where: (t, { eq }) => eq(t.householdId, householdId),
      orderBy: (t, { asc }) => asc(t.name),
    });

    return rows.map((c) => ({
      id: c.id,
      householdId: c.householdId,
      name: c.name,
      createdAt: c.createdAt,
    }));
  },

  async create(params) {
    try {
      await db.insert(categories).values({
        id: params.id,
        householdId: params.householdId,
        name: params.name,
      });
    } catch {
      throw new CategoryAlreadyExistsError();
    }
  },

  async rename(params) {
    try {
      const updated = await db
        .update(categories)
        .set({ name: params.name })
        .where(and(eq(categories.id, params.categoryId), eq(categories.householdId, params.householdId)))
        .returning({ id: categories.id });

      if (updated.length === 0) throw new CategoryNotFoundError();
    } catch (err) {
      if (err instanceof CategoryNotFoundError) throw err;
      throw new CategoryAlreadyExistsError();
    }
  },

  async delete(params) {
    const deleted = await db
      .delete(categories)
      .where(and(eq(categories.id, params.categoryId), eq(categories.householdId, params.householdId)))
      .returning({ id: categories.id });

    if (deleted.length === 0) throw new CategoryNotFoundError();
  },
};
