import { Form } from "react-router";

import type { Category } from "~/domain/categories/entity";

export function CategoriesPage(props: {
  categories: Category[];
  error?: string;
  ok?: boolean;
}) {
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Categorias</h1>
      </div>

      <div className="mt-6 grid gap-6">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Criar categoria</h2>

            <Form method="post" className="space-y-3">
              <input type="hidden" name="intent" value="create" />

              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Nome</span>
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Ex.: Mercado"
                  className="input input-bordered w-full"
                  aria-invalid={props.error ? true : undefined}
                  aria-describedby={props.error ? "categories-error" : undefined}
                />
              </div>

              {props.error ? (
                <div id="categories-error" role="alert" className="alert alert-error">
                  <span>{props.error}</span>
                </div>
              ) : null}

              {props.ok ? (
                <div role="status" className="alert alert-success">
                  <span>Salvo.</span>
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

            {props.categories.length === 0 ? (
              <p className="opacity-70">Nenhuma categoria.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th className="text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.categories.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <Form method="post" className="flex items-center gap-2">
                            <input type="hidden" name="intent" value="rename" />
                            <input type="hidden" name="categoryId" value={c.id} />
                            <input
                              name="name"
                              defaultValue={c.name}
                              className="input input-bordered input-sm w-full"
                            />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Renomear
                            </button>
                          </Form>
                        </td>
                        <td className="text-right">
                          <Form
                            method="post"
                            onSubmit={(e) => {
                              if (!window.confirm(`Excluir a categoria "${c.name}"?`)) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="categoryId" value={c.id} />
                            <button type="submit" className="btn btn-ghost btn-sm">
                              Excluir
                            </button>
                          </Form>
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
