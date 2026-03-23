import { Form } from "react-router";

import type { Category } from "~/domain/categories/entity";
import FormModal, { ModalCloseButton, closeDialogOnSubmit } from "~/ui/FormModal";

function CategoryCreateModal(props: { error?: string }) {
  return (
    <FormModal
      dialogId="create_category_modal"
      triggerLabel="Criar categoria"
      title="Criar categoria"
      description="Cadastre uma categoria para organizar as transações da household."
      triggerClassName="btn btn-primary"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="create" />

        <div className="form-control">
          <label className="label" htmlFor="category-create-name">
            <span className="label-text">Nome</span>
          </label>
          <input
            id="category-create-name"
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

        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Criar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function CategoryRenameModal(props: { category: Category }) {
  return (
    <FormModal
      dialogId={`rename_category_modal_${props.category.id}`}
      triggerLabel="Renomear"
      title="Renomear categoria"
      description={`Atualize o nome da categoria \"${props.category.name}\".`}
      triggerClassName="btn btn-ghost btn-sm"
      dialogClassName="max-w-lg"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="rename" />
        <input type="hidden" name="categoryId" value={props.category.id} />

        <div className="form-control">
          <label className="label" htmlFor={`category-rename-name-${props.category.id}`}>
            <span className="label-text">Nome</span>
          </label>
          <input
            id={`category-rename-name-${props.category.id}`}
            name="name"
            defaultValue={props.category.name}
            className="input input-bordered w-full"
          />
        </div>

        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Salvar nome
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

function CategoryDeleteModal(props: { category: Category }) {
  return (
    <FormModal
      dialogId={`delete_category_modal_${props.category.id}`}
      triggerLabel="Excluir"
      title="Excluir categoria"
      description={`Tem certeza que deseja excluir a categoria \"${props.category.name}\"?`}
      triggerClassName="btn btn-ghost btn-sm text-error"
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="categoryId" value={props.category.id} />
        <p className="text-sm opacity-70">As transações existentes ficam sem categoria após a exclusão.</p>
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-error">
            Excluir categoria
          </button>
        </div>
      </Form>
    </FormModal>
  );
}

export function CategoriesPage(props: {
  categories: Category[];
  error?: string;
  ok?: boolean;
}) {
  return (
    <main className="mx-auto mt-10 max-w-2xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <CategoryCreateModal error={props.error} />
      </div>

      <div className="mt-6 grid gap-6">
        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        {props.ok ? (
          <div role="status" className="alert alert-success">
            <span>Salvo.</span>
          </div>
        ) : null}

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
                        <td>{c.name}</td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <CategoryRenameModal category={c} />
                            <CategoryDeleteModal category={c} />
                          </div>
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
