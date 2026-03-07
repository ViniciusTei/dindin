import type { Route } from "./+types/categories";
import crypto from "node:crypto";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { categoriesRepo } from "~/db/repositories/categories.repo.server";
import { createCategory } from "~/domain/categories/usecases/create-category";
import { deleteCategory } from "~/domain/categories/usecases/delete-category";
import { listCategories } from "~/domain/categories/usecases/list-categories";
import { renameCategory } from "~/domain/categories/usecases/rename-category";
import { CategoriesPage } from "~/domain/categories/ui/CategoriesPage";

function createId(): string {
  return crypto.randomUUID();
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const categories = await listCategories({ categoriesRepo, householdId });
  return { categories };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const name = String(form.get("name") ?? "");

    const result = await createCategory({
      categoriesRepo,
      idFactory: createId,
      householdId,
      name,
    });

    if (!result.ok) {
      switch (result.error) {
        case "NAME_REQUIRED":
          return { error: "Nome é obrigatório." };
        case "ALREADY_EXISTS":
          return { error: "Já existe uma categoria com esse nome." };
      }
    }

    return { ok: true };
  }

  if (intent === "rename") {
    const categoryId = String(form.get("categoryId") ?? "");
    const name = String(form.get("name") ?? "");

    const result = await renameCategory({
      categoriesRepo,
      householdId,
      categoryId,
      name,
    });

    if (!result.ok) {
      switch (result.error) {
        case "NAME_REQUIRED":
          return { error: "Nome é obrigatório." };
        case "NOT_FOUND":
          return { error: "Categoria não encontrada." };
        case "ALREADY_EXISTS":
          return { error: "Já existe uma categoria com esse nome." };
      }
    }

    return { ok: true };
  }

  if (intent === "delete") {
    const categoryId = String(form.get("categoryId") ?? "");

    const result = await deleteCategory({ categoriesRepo, householdId, categoryId });

    if (!result.ok) {
      return { error: "Categoria não encontrada." };
    }

    return { ok: true };
  }

  return { error: "Ação inválida" };
}

export default function Categories({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <CategoriesPage
      categories={loaderData.categories}
      error={actionData?.error}
      ok={actionData?.ok}
    />
  );
}
