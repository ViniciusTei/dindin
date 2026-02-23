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
  const mm = String(form.get("mm") ?? "").trim();

  if (!ym || !mm) return { error: "Ano e mês são obrigatórios." };
  if (!/^\d{4}$/.test(ym)) return { error: "Ano deve conter 4 dígitos." };
  if (!/^(0[1-9]|1[0-2])$/.test(mm)) return { error: "Mês deve ser entre 01 e 12." };
  if (!isYm(`${ym}-${mm}`)) return { error: "Competência inválida (YYYY-MM)." };

  const id = crypto.randomUUID();
  try {
    await db.insert(months).values({
      id,
      householdId,
      ym: `${ym}-${mm}`,
      status: "open",
    });
  } catch {
    return { error: "Mês já existe." };
  }

  return redirect(`/months/${id}`);
}

export default function Months({
  loaderData,
  actionData,
}: Route.ComponentProps) {
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
                  <span className="label-text">Ano</span>
                </label>
                <input
                  id="ym"
                  name="ym"
                  placeholder="2026"
                  className="input input-bordered w-full"
                  aria-invalid={actionData?.error ? true : undefined}
                  aria-describedby={
                    actionData?.error ? "months-error" : undefined
                  }
                  defaultValue={new Date().getFullYear()}
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="mm">
                  <span className="label-text">Mês</span>
                </label>
                <select id="mm" name="mm" defaultValue="Selecione" className="select w-full">
                  <option disabled={true}>Selecione</option>
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>

              {actionData?.error ? (
                <div
                  id="months-error"
                  role="alert"
                  className="alert alert-error"
                >
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
                          <Link
                            className="link link-primary"
                            to={`/months/${m.id}`}
                          >
                            {m.ym}
                          </Link>
                        </td>
                        <td>
                          <span className="badge badge-outline">
                            {m.status}
                          </span>
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
