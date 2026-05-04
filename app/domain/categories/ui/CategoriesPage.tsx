import { useState } from "react";
import { Form, useNavigation } from "react-router";

import { HouseholdContextBar, type HouseholdContext } from "~/domain/households/ui/HouseholdContextBar";
import type { Category } from "~/domain/categories/entity";
import Icon from "~/ui/Icon";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";

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

function CategoryDeleteModal(props: { category: Category }) {
  return (
    <FormModal
      dialogId={`delete_category_modal_${props.category.id}`}
      triggerLabel="Excluir categoria"
      triggerContent={<Icon name="trash" className="h-4 w-4" />}
      triggerClassName="btn btn-ghost btn-sm btn-square text-error"
      title="Excluir categoria"
      description={`Tem certeza que deseja excluir a categoria "${props.category.name}"?`}
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="delete" />
        <input type="hidden" name="categoryId" value={props.category.id} />
        <p className="text-sm opacity-70">
          As transações existentes ficam sem categoria após a exclusão.
        </p>
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
  household?: HouseholdContext;
  error?: string;
  ok?: boolean;
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      {props.household ? <HouseholdContextBar household={props.household} /> : null}
      <div className="p-4 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Categorias</h1>
          <CategoryCreateModal error={props.error} />
        </div>

        {props.error ? (
          <div role="alert" className="alert alert-error mb-4">
            <span>{props.error}</span>
          </div>
        ) : null}

        {props.ok ? (
          <div role="status" className="alert alert-success mb-4">
            <span>Salvo.</span>
          </div>
        ) : null}

        {props.categories.length === 0 ? (
          <p className="opacity-70">Nenhuma categoria.</p>
        ) : (
          <div className="card bg-base-100 rounded-box shadow">
            <div className="card-body p-0">
              <ul className="divide-y divide-base-200">
                {props.categories.map((category) => (
                  <li key={category.id} className="flex items-center gap-3 p-3">
                    {editingId === category.id ? (
                      <Form
                        method="post"
                        className="flex flex-1 items-center gap-2"
                        onSubmit={() => setEditingId(null)}
                      >
                        <input type="hidden" name="intent" value="rename" />
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input
                          type="text"
                          name="name"
                          defaultValue={category.name}
                          className="input input-sm input-bordered flex-1"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="btn btn-sm btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : null}
                          Salvar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </button>
                      </Form>
                    ) : (
                      <>
                        <span className="flex-1">{category.name}</span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-square"
                          aria-label="Renomear categoria"
                          onClick={() => setEditingId(category.id)}
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </button>
                        <CategoryDeleteModal category={category} />
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
