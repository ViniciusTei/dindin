import { Form } from "react-router";

import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";
import Icon from "~/ui/Icon";
import type { Transaction } from "../entity";

export default function TransactionDeleteModal(props: { transaction: Transaction }) {
  return (
    <FormModal
      dialogId={`delete_transaction_modal_${props.transaction.id}`}
      triggerLabel="Excluir transação"
      triggerContent={<Icon name="trash" className="h-4 w-4" />}
      triggerClassName="btn btn-ghost btn-sm btn-square text-error"
      title="Excluir transação"
      description={`Tem certeza que deseja excluir "${props.transaction.description}"?`}
      dialogClassName="max-w-lg"
      resetFormOnOpen={false}
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-3">
        <input type="hidden" name="intent" value="delete" />
        <input
          type="hidden"
          name="transactionId"
          value={props.transaction.id}
        />
        <p className="text-sm opacity-70">
          A remoção ajusta o saldo da conta vinculada.
        </p>
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-error">
            Excluir transação
          </button>
        </div>
      </Form>
    </FormModal>
  );
}
