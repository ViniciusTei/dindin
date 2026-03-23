import type { ReactNode } from "react";

type FormModalProps = {
  dialogId: string;
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  triggerClassName?: string;
  triggerTestId?: string;
  dialogClassName?: string;
  resetFormOnOpen?: boolean;
};

function openDialog(dialogId: string, resetFormOnOpen: boolean) {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  if (!dialog) {
    console.error(`Dialog element \"${dialogId}\" not found`);
    return;
  }

  if (!dialog.open) {
    dialog.showModal();
  }

  if (!resetFormOnOpen) {
    return;
  }

  const form = Array.from(dialog.querySelectorAll("form")).find(
    (candidate) => candidate.getAttribute("method") !== "dialog",
  );
  form?.reset();
}

export function closeDialogOnSubmit(event: { currentTarget: Element }) {
  const dialog = event.currentTarget.closest("dialog") as HTMLDialogElement | null;
  dialog?.close();
}

export function ModalCloseButton(props: { children?: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={props.className ?? "btn"}
      onClick={closeDialogOnSubmit}
    >
      {props.children ?? "Cancelar"}
    </button>
  );
}

export default function FormModal(props: FormModalProps) {
  return (
    <>
      <button
        type="button"
        className={props.triggerClassName ?? "btn btn-primary"}
        data-testid={props.triggerTestId}
        onClick={() => openDialog(props.dialogId, props.resetFormOnOpen ?? true)}
      >
        {props.triggerLabel}
      </button>
      <dialog
        id={props.dialogId}
        className="modal"
        aria-labelledby={`${props.dialogId}-title`}
      >
        <section
          className={`card bg-base-100 shadow modal-box ${props.dialogClassName ?? "max-w-2xl"}`}
        >
          <div className="card-body gap-4">
            <div>
              <h2 id={`${props.dialogId}-title`} className="card-title">
                {props.title}
              </h2>
              {props.description ? (
                <p className="mt-1 text-sm opacity-70">{props.description}</p>
              ) : null}
            </div>
            {props.children}
          </div>
        </section>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
