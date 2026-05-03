import type { ReactNode } from "react";

import {
  closeResponsiveModal,
  ModalCloseButton,
  openResponsiveModal,
  ResponsiveModal,
} from "./ResponsiveModal";

export { closeResponsiveModal as closeDialogOnSubmit, ModalCloseButton };

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

export default function FormModal(props: FormModalProps) {
  return (
    <>
      <button
        type="button"
        className={props.triggerClassName ?? "btn btn-primary"}
        data-testid={props.triggerTestId}
        onClick={() =>
          openResponsiveModal(props.dialogId, props.resetFormOnOpen ?? true)
        }
      >
        {props.triggerLabel}
      </button>
      <ResponsiveModal
        dialogId={props.dialogId}
        title={props.title}
        description={props.description}
        dialogClassName={props.dialogClassName}
      >
        {props.children}
      </ResponsiveModal>
    </>
  );
}
