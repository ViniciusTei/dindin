import { Form } from "react-router";

import FormModal, { ModalCloseButton, closeDialogOnSubmit } from "~/ui/FormModal";

export default function HouseholdCreateModal(props: { error?: string }) {
  return (
    <FormModal
      dialogId="create_household_modal"
      triggerLabel="Criar Rateio"
      title="Criar Rateio"
      description="Crie uma nova household e depois configure membros, convites e rateio."
      triggerClassName="btn btn-primary"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <div className="form-control">
          <label className="label" htmlFor="household-name">
            <span className="label-text">Nome</span>
          </label>
          <input
            id="household-name"
            name="name"
            placeholder="Ex.: Casa, Apartamento, Família"
            className="input input-bordered w-full"
            aria-invalid={props.error ? true : undefined}
            aria-describedby={props.error ? "households-error" : undefined}
          />
        </div>

        {props.error ? (
          <div id="households-error" role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}
        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="household-create-button"
          >
            Criar Rateio
          </button>
        </div>
      </Form>
    </FormModal>
  );
}
