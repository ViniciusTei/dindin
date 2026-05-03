import type { ReactNode } from "react";

type ResponsiveModalProps = {
  dialogId: string;
  title: string;
  description?: string;
  children: ReactNode;
  dialogClassName?: string;
};

export function openResponsiveModal(dialogId: string, resetForm: boolean) {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  if (!dialog) {
    console.error(`Dialog element "${dialogId}" not found`);
    return;
  }

  if (!dialog.open) {
    dialog.showModal();
  }

  if (!resetForm) return;

  const form = Array.from(dialog.querySelectorAll("form")).find(
    (candidate) => candidate.getAttribute("method") !== "dialog",
  );
  form?.reset();
}

export function closeResponsiveModal(event: { currentTarget: Element }) {
  const dialog = event.currentTarget.closest(
    "dialog",
  ) as HTMLDialogElement | null;
  dialog?.close();
}

export function ModalCloseButton(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={props.className ?? "btn"}
      onClick={closeResponsiveModal}
    >
      {props.children ?? "Cancelar"}
    </button>
  );
}

export function ResponsiveModal(props: ResponsiveModalProps) {
  return (
    <dialog
      id={props.dialogId}
      className="modal modal-bottom sm:modal-middle"
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
  );
}
