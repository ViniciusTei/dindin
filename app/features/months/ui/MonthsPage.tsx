import { Form, Link } from "react-router";

import type { Month } from "~/domain/months/entity";

export function MonthsPage(props: { months: Month[]; error?: string }) {
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
                  aria-invalid={props.error ? true : undefined}
                  aria-describedby={props.error ? "months-error" : undefined}
                  defaultValue={new Date().getFullYear()}
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="mm">
                  <span className="label-text">Mês</span>
                </label>
                <select
                  id="mm"
                  name="mm"
                  defaultValue="Selecione"
                  className="select w-full"
                >
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

              {props.error ? (
                <div id="months-error" role="alert" className="alert alert-error">
                  <span>{props.error}</span>
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

            {props.months.length === 0 ? (
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
                    {props.months.map((m) => (
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
