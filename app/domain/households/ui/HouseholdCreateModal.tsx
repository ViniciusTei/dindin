import { Form } from "react-router";

export default function HouseholdCreateModal(props: { error?: string }) {
  const onOpen = () => {
    const openDialog = document.getElementById(
      "create_household_modal",
    ) as HTMLDialogElement | null;
    if (!openDialog) {
      console.error("Dialog element not found");
      return;
    }

    openDialog.showModal();

    const form = openDialog.querySelector("form") as HTMLFormElement | null;
    if (form) {
      form.reset();
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={onOpen}>
        Criar household
      </button>
      <dialog id="create_household_modal" className="modal">
        <section className="card bg-base-100 shadow modal-box">
          <div className="card-body gap-4">
            <h2 className="card-title">Criar household</h2>
            <p className="text-sm opacity-70">
              Crie uma nova household e depois configure membros, convites e
              rateio.
            </p>

            <Form method="post" className="space-y-3">
              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Nome</span>
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="Ex.: Casa, Apartamento, Família"
                  className="input input-bordered w-full"
                  aria-invalid={props.error ? true : undefined}
                  aria-describedby={
                    props.error ? "households-error" : undefined
                  }
                />
              </div>

              {props.error ? (
                <div
                  id="households-error"
                  role="alert"
                  className="alert alert-error"
                >
                  <span>{props.error}</span>
                </div>
              ) : null}
              <div className="modal-action">
                {/* This will clode the modal */}
                <form method="dialog">
                  <button className="btn">Cancelar</button>
                </form>
                <button
                  type="submit"
                  className="btn btn-primary"
                  data-testid="household-create-button"
                >
                  Criar household
                </button>
              </div>
            </Form>
          </div>
        </section>
        {/* This is needed to close the modal when clicking outside of it */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
