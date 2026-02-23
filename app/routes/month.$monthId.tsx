import type { Route } from "./+types/month.$monthId";
import crypto from "node:crypto";

import { toCents } from "~/domain/money";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { monthRepo } from "~/db/repositories/month.repo.server";
import { addExpense } from "~/domain/month/usecases/add-expense";
import { closeMonth } from "~/domain/month/usecases/close-month";
import { completeTransfer } from "~/domain/month/usecases/complete-transfer";
import { deleteExpense } from "~/domain/month/usecases/delete-expense";
import { reopenMonth } from "~/domain/month/usecases/reopen-month";
import { setIncome } from "~/domain/month/usecases/set-income";
import { togglePaid } from "~/domain/month/usecases/toggle-paid";
import { MonthDetailPage } from "~/features/month/ui/MonthDetailPage";
import { getMonthDetailLoaderData } from "~/features/month/view-model.server";

function createId(): string {
  return crypto.randomUUID();
}

function now() {
  return new Date();
}

async function getMonthOrThrow(params: { monthId: string; householdId: string }) {
  const month = await monthRepo.getMonth({ monthId: params.monthId, householdId: params.householdId });
  if (!month) throw new Response("Mês não encontrado", { status: 404 });
  return month;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);
  const monthId = String(params.monthId);

  return getMonthDetailLoaderData({ monthId, householdId });
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);
  const monthId = String(params.monthId);

  const month = await getMonthOrThrow({ monthId, householdId });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (month.status === "closed" && intent !== "reopen") {
    return { error: "Mês fechado. Reabra para editar." };
  }

  if (intent === "setIncome") {
    const targetUserId = String(form.get("userId") ?? "");
    const amountCents = toCents(form.get("amount"));

    const result = await setIncome({
      repo: monthRepo,
      idFactory: createId,
      monthId,
      userId: targetUserId,
      amountCents,
    });

    if (!result.ok) return { error: "Usuário inválido" };
    return { ok: true };
  }

  if (intent === "addExpense") {
    const description = String(form.get("description") ?? "").trim();
    const categoryId = String(form.get("categoryId") ?? "").trim();
    const amountCents = toCents(form.get("amount"));

    const result = await addExpense({
      repo: monthRepo,
      idFactory: createId,
      monthId,
      description,
      categoryId,
      amountCents,
    });

    if (!result.ok) {
      switch (result.error) {
        case "DESCRIPTION_REQUIRED":
          return { error: "Descrição obrigatória" };
        case "CATEGORY_REQUIRED":
          return { error: "Categoria obrigatória" };
        case "AMOUNT_INVALID":
          return { error: "Valor inválido" };
      }
    }

    return { ok: true };
  }

  if (intent === "togglePaid") {
    const expenseId = String(form.get("expenseId") ?? "");
    const checked = form.get("isPaid") === "on";

    const result = await togglePaid({ repo: monthRepo, monthId, expenseId, isPaid: checked });
    if (!result.ok) return { error: "Despesa inválida" };
    return { ok: true };
  }

  if (intent === "deleteExpense") {
    const expenseId = String(form.get("expenseId") ?? "");

    const result = await deleteExpense({ repo: monthRepo, monthId, expenseId });
    if (!result.ok) return { error: "Despesa inválida" };
    return { ok: true };
  }

  if (intent === "close") {
    const result = await closeMonth({
      repo: monthRepo,
      idFactory: createId,
      now,
      householdId,
      monthId,
    });

    if (!result.ok) return { error: "Sem membros" };
    return { ok: true };
  }

  if (intent === "reopen") {
    await reopenMonth({ repo: monthRepo, monthId });
    return { ok: true };
  }

  if (intent === "completeTransfer") {
    const transferId = String(form.get("transferId") ?? "");
    const completed = form.get("completed") === "on";

    const result = await completeTransfer({
      repo: monthRepo,
      monthId,
      transferId,
      completed,
      now,
    });
    if (!result.ok) return { error: "Transferência inválida" };
    return { ok: true };
  }

  return { error: "Ação inválida" };
}

export default function MonthDetail({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <MonthDetailPage
      month={loaderData.month}
      members={loaderData.members}
      incomes={loaderData.incomes}
      categories={loaderData.categories}
      expenses={loaderData.expenses}
      totalExpenseCents={loaderData.totalExpenseCents}
      dues={loaderData.dues}
      transfers={loaderData.transfers}
      error={actionData?.error}
    />
  );
}
