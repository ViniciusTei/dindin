import type { Route } from "./+types/month.$monthId";
import crypto from "node:crypto";

import { Form, Link } from "react-router";
import { and, eq, inArray } from "drizzle-orm";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { db } from "~/db/db.server";
import {
  categories,
  expenses,
  incomes,
  memberships,
  months,
  transfers,
  users,
} from "~/db/schema";
import { computeDueByIncome, suggestTransfersToAdmin } from "~/domain/calc";
import { formatBRL, toCents } from "~/domain/money";

function createId(): string {
  return crypto.randomUUID();
}

function now() {
  return new Date();
}

async function getMonthOrThrow(params: {
  monthId: string;
  householdId: string;
}) {
  const month = await db.query.months.findFirst({
    where: (t, { and, eq }) =>
      and(eq(t.id, params.monthId), eq(t.householdId, params.householdId)),
  });
  if (!month) throw new Response("Mês não encontrado", { status: 404 });
  return month;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);
  const monthId = String(params.monthId);

  const month = await getMonthOrThrow({ monthId, householdId });

  const memberRows = await db
    .select({
      userId: memberships.userId,
      role: memberships.role,
      username: users.username,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.householdId, householdId));

  const admin = memberRows.find((m) => m.role === "admin");
  const memberUserIds = memberRows.map((m) => m.userId);

  const incomeRows = await db
    .select({ userId: incomes.userId, amountCents: incomes.amountCents })
    .from(incomes)
    .where(and(eq(incomes.monthId, monthId), inArray(incomes.userId, memberUserIds)));

  const incomeByUser = new Map(incomeRows.map((r) => [r.userId, r.amountCents] as const));

  const expenseRows = await db.query.expenses.findMany({
    where: (t, { eq }) => eq(t.monthId, monthId),
    orderBy: (t, { desc }) => desc(t.createdAt),
  });

  const totalExpenseCents = expenseRows.reduce((acc, e) => acc + e.amountCents, 0);

  const dues = computeDueByIncome({
    members: memberRows.map((m) => ({
      userId: m.userId,
      incomeCents: incomeByUser.get(m.userId) ?? 0,
    })),
    totalExpenseCents,
  });

  const cats = await db.query.categories.findMany({
    where: (t, { eq }) => eq(t.householdId, householdId),
    orderBy: (t, { asc }) => asc(t.name),
  });

  const transferRows = await db.query.transfers.findMany({
    where: (t, { eq }) => eq(t.monthId, monthId),
    orderBy: (t, { asc }) => asc(t.createdAt),
  });

  return {
    month,
    members: memberRows,
    adminUserId: admin?.userId ?? memberRows[0]?.userId ?? null,
    incomes: Object.fromEntries(memberRows.map((m) => [m.userId, incomeByUser.get(m.userId) ?? null])),
    categories: cats,
    expenses: expenseRows,
    totalExpenseCents,
    dues,
    transfers: transferRows,
  };
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
    if (!targetUserId) return { error: "Usuário inválido" };
    if (amountCents == null) {
      // remover renda
      await db.delete(incomes).where(and(eq(incomes.monthId, monthId), eq(incomes.userId, targetUserId)));
      return { ok: true };
    }

    // upsert manual
    const existing = await db.query.incomes.findFirst({
      where: (t, { and, eq }) => and(eq(t.monthId, monthId), eq(t.userId, targetUserId)),
    });

    if (existing) {
      await db
        .update(incomes)
        .set({ amountCents })
        .where(eq(incomes.id, existing.id));
    } else {
      await db.insert(incomes).values({
        id: createId(),
        monthId,
        userId: targetUserId,
        amountCents,
      });
    }

    return { ok: true };
  }

  if (intent === "addExpense") {
    const description = String(form.get("description") ?? "").trim();
    const categoryId = String(form.get("categoryId") ?? "").trim();
    const amountCents = toCents(form.get("amount"));

    if (!description) return { error: "Descrição obrigatória" };
    if (!categoryId) return { error: "Categoria obrigatória" };
    if (amountCents == null || amountCents <= 0) return { error: "Valor inválido" };

    await db.insert(expenses).values({
      id: createId(),
      monthId,
      categoryId,
      description,
      amountCents,
      isPaid: false,
    });

    return { ok: true };
  }

  if (intent === "togglePaid") {
    const expenseId = String(form.get("expenseId") ?? "");
    const checked = form.get("isPaid") === "on";
    if (!expenseId) return { error: "Despesa inválida" };

    await db
      .update(expenses)
      .set({ isPaid: checked })
      .where(and(eq(expenses.id, expenseId), eq(expenses.monthId, monthId)));

    return { ok: true };
  }

  if (intent === "deleteExpense") {
    const expenseId = String(form.get("expenseId") ?? "");
    if (!expenseId) return { error: "Despesa inválida" };

    await db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.monthId, monthId)));

    return { ok: true };
  }

  if (intent === "close") {
    const memberRows = await db
      .select({ userId: memberships.userId, role: memberships.role })
      .from(memberships)
      .where(eq(memberships.householdId, householdId));

    const admin = memberRows.find((m) => m.role === "admin");
    const adminUserId = admin?.userId ?? memberRows[0]?.userId;
    if (!adminUserId) return { error: "Sem membros" };

    const memberUserIds = memberRows.map((m) => m.userId);
    const incomeRows = await db
      .select({ userId: incomes.userId, amountCents: incomes.amountCents })
      .from(incomes)
      .where(and(eq(incomes.monthId, monthId), inArray(incomes.userId, memberUserIds)));

    const incomeByUser = new Map(incomeRows.map((r) => [r.userId, r.amountCents] as const));

    const expenseRows = await db.query.expenses.findMany({
      where: (t, { eq }) => eq(t.monthId, monthId),
    });
    const totalExpenseCents = expenseRows.reduce((acc, e) => acc + e.amountCents, 0);

    const dues = computeDueByIncome({
      members: memberRows.map((m) => ({
        userId: m.userId,
        incomeCents: incomeByUser.get(m.userId) ?? 0,
      })),
      totalExpenseCents,
    });

    const suggestions = suggestTransfersToAdmin({ adminUserId, dues });

    await db.delete(transfers).where(eq(transfers.monthId, monthId));
    for (const t of suggestions) {
      await db.insert(transfers).values({
        id: createId(),
        monthId,
        fromUserId: t.fromUserId,
        toUserId: t.toUserId,
        amountCents: t.amountCents,
      });
    }

    await db
      .update(months)
      .set({ status: "closed", closedAt: now() })
      .where(eq(months.id, monthId));

    return { ok: true };
  }

  if (intent === "reopen") {
    // simples: reabrir sem apagar dados
    await db
      .update(months)
      .set({ status: "open", closedAt: null })
      .where(eq(months.id, monthId));
    return { ok: true };
  }

  if (intent === "completeTransfer") {
    const transferId = String(form.get("transferId") ?? "");
    if (!transferId) return { error: "Transferência inválida" };

    const completed = form.get("completed") === "on";

    await db
      .update(transfers)
      .set({ completedAt: completed ? now() : null })
      .where(and(eq(transfers.id, transferId), eq(transfers.monthId, monthId)));

    return { ok: true };
  }

  return { error: "Ação inválida" };
}

export default function MonthDetail({ loaderData, actionData }: Route.ComponentProps) {
  const { month, members, incomes, categories, expenses, totalExpenseCents, dues, transfers } = loaderData;

  const dueByUser = new Map(dues.map((d) => [d.userId, d.dueCents] as const));

  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Mês {month.ym}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">Status</span>
          <span className="badge badge-outline">{month.status}</span>
        </div>
      </div>

      {actionData?.error ? (
        <div role="alert" className="alert alert-error mt-4">
          <span>{actionData.error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Rendas</h2>
            <div className="space-y-3">
              {members.map((m) => (
                <Form method="post" key={m.userId} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <input type="hidden" name="intent" value="setIncome" />
                  <input type="hidden" name="userId" value={m.userId} />

                  <div className="w-full sm:w-44">
                    <div className="text-sm opacity-70">Usuário</div>
                    <div className="font-medium">{m.username}</div>
                  </div>

                  <div className="form-control w-full sm:max-w-xs">
                    <label className="label" htmlFor={`income-${m.userId}`}>
                      <span className="label-text">Renda</span>
                    </label>
                    <input
                      id={`income-${m.userId}`}
                      name="amount"
                      placeholder="0,00"
                      defaultValue={(() => {
                        const incomeCents = incomes[m.userId];
                        if (incomeCents == null) return "";
                        return String((incomeCents / 100).toFixed(2)).replace(".", ",");
                      })()}
                      disabled={month.status === "closed"}
                      className="input input-bordered w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={month.status === "closed"}
                    className="btn btn-primary sm:btn-sm"
                  >
                    Salvar
                  </button>
                </Form>
              ))}
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Despesas</h2>

            <Form method="post" className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
              <input type="hidden" name="intent" value="addExpense" />

              <div className="form-control md:col-span-2">
                <label className="label" htmlFor="description">
                  <span className="label-text">Descrição</span>
                </label>
                <input
                  id="description"
                  name="description"
                  disabled={month.status === "closed"}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="categoryId">
                  <span className="label-text">Categoria</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  disabled={month.status === "closed"}
                  defaultValue=""
                  className="select select-bordered w-full"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="amount">
                  <span className="label-text">Valor</span>
                </label>
                <input
                  id="amount"
                  name="amount"
                  placeholder="0,00"
                  disabled={month.status === "closed"}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="md:col-span-4">
                <button type="submit" disabled={month.status === "closed"} className="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </Form>

            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th className="text-right">Valor</th>
                    <th className="text-center">Pago</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td>{e.description}</td>
                      <td>{categories.find((c) => c.id === e.categoryId)?.name ?? ""}</td>
                      <td className="text-right">{formatBRL(e.amountCents)}</td>
                      <td className="text-center">
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="togglePaid" />
                          <input type="hidden" name="expenseId" value={e.id} />
                          <input
                            type="checkbox"
                            name="isPaid"
                            className="checkbox checkbox-sm"
                            defaultChecked={e.isPaid}
                            onChange={(ev) => {
                              const form = ev.currentTarget.form;
                              if (form) form.requestSubmit();
                            }}
                            disabled={month.status === "closed"}
                            aria-label="Marcar como paga"
                          />
                        </Form>
                      </td>
                      <td className="text-right">
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="deleteExpense" />
                          <input type="hidden" name="expenseId" value={e.id} />
                          <button
                            type="submit"
                            disabled={month.status === "closed"}
                            className="btn btn-error btn-outline btn-sm"
                          >
                            Excluir
                          </button>
                        </Form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Resumo</h2>
            <p>
              Total: <span className="font-medium">{formatBRL(totalExpenseCents)}</span>
            </p>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Membro</th>
                    <th className="text-right">Devido</th>
                    <th className="text-right">Renda</th>
                    <th className="text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const income = incomes[m.userId] ?? 0;
                    const due = dueByUser.get(m.userId) ?? 0;
                    const balance = income - due;
                    return (
                      <tr key={m.userId}>
                        <td>{m.username}</td>
                        <td className="text-right">{formatBRL(due)}</td>
                        <td className="text-right">{formatBRL(income)}</td>
                        <td className="text-right">{formatBRL(balance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-2">
              {month.status === "open" ? (
                <Form method="post">
                  <input type="hidden" name="intent" value="close" />
                  <button type="submit" className="btn btn-primary">
                    Fechar mês
                  </button>
                </Form>
              ) : (
                <Form method="post">
                  <input type="hidden" name="intent" value="reopen" />
                  <button type="submit" className="btn btn-secondary">
                    Reabrir mês
                  </button>
                </Form>
              )}

              <a
                className="btn btn-outline"
                href={`/months/${month.id}/export.csv`}
                target="_blank"
                rel="noreferrer"
              >
                Exportar CSV
              </a>
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Transferências (sugeridas)</h2>
            {transfers.length === 0 ? <p className="opacity-70">Nenhuma (ainda).</p> : null}

            <ul className="space-y-2">
              {transfers.map((t) => (
                <li key={t.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-medium">
                      {members.find((m) => m.userId === t.fromUserId)?.username ?? t.fromUserId}
                    </span>{" "}
                    →{" "}
                    <span className="font-medium">
                      {members.find((m) => m.userId === t.toUserId)?.username ?? t.toUserId}
                    </span>
                    : <span className="font-mono">{formatBRL(t.amountCents)}</span>
                  </div>

                  <Form method="post" className="inline">
                    <input type="hidden" name="intent" value="completeTransfer" />
                    <input type="hidden" name="transferId" value={t.id} />
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        name="completed"
                        className="checkbox checkbox-sm"
                        defaultChecked={Boolean(t.completedAt)}
                        onChange={(ev) => {
                          const form = ev.currentTarget.form;
                          if (form) form.requestSubmit();
                        }}
                      />
                      <span className="label-text">concluída</span>
                    </label>
                  </Form>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6">
        <Link className="btn btn-ghost btn-sm" to="/months">
          Voltar
        </Link>
      </div>
    </main>
  );
}
