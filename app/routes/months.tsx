import type { Route } from "./+types/months";
import crypto from "node:crypto";
import { Form, Link, redirect } from "react-router";

import { requireUserId } from "~/auth/session.server";
import { requireHouseholdId } from "~/auth/household.server";
import { db } from "~/db/db.server";
import { months } from "~/db/schema";

function isYm(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const list = await db.query.months.findMany({
    where: (t, { eq }) => eq(t.householdId, householdId),
    orderBy: (t, { desc }) => desc(t.ym),
  });

  return { months: list };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const householdId = await requireHouseholdId(userId);

  const form = await request.formData();
  const ym = String(form.get("ym") ?? "").trim();

  if (!isYm(ym)) return { error: "Competência inválida (YYYY-MM)." };

  const id = crypto.randomUUID();
  try {
    await db.insert(months).values({
      id,
      householdId,
      ym,
      status: "open",
    });
  } catch {
    return { error: "Mês já existe." };
  }

  return redirect(`/months/${id}`);
}

export default function Months({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Meses</h1>
        <Link className="btn btn-ghost btn-sm" to="/">
          Voltar
        </Link>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Criar mês</h2>

            <Form method="post" className="space-y-3">
              <div className="form-control">
                <label className="label" htmlFor="ym">
                  <span className="label-text">Competência (YYYY-MM)</span>
                </label>
                <input
                  id="ym"
                  name="ym"
                  placeholder="2026-02"
                  className="input input-bordered w-full"
                  aria-invalid={actionData?.error ? true : undefined}
                  aria-describedby={actionData?.error ? "months-error" : undefined}
                />
              </div>

              {actionData?.error ? (
                <div id="months-error" role="alert" className="alert alert-error">
                  <span>{actionData.error}</span>
                </div>
              ) : null}

              <button type="submit" className="btn btn-primary">
                Criar
              </button>
            </Form>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Lista</h2>

            {loaderData.months.length === 0 ? (
              <p className="opacity-70">Nenhum mês criado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Mês</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaderData.months.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <Link className="link link-primary" to={`/months/${m.id}`}>
                            {m.ym}
                          </Link>
                        </td>
                        <td>
                          <span className="badge badge-outline">{m.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
