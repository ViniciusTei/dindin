import { Form } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";
import TransactionFormFields from "./TransactionFormFields";
import type { Transaction } from "../entity";
import { centsToInput, toDateInputValue } from "../helpers";

export default function TransactionEditModal(props: {
  accounts: Account[];
  categories: Category[];
  transaction: Transaction;
}) {
  return (
    <FormModal
      dialogId={`edit_transaction_modal_${props.transaction.id}`}
      triggerLabel="Editar"
      title="Editar transação"
      description={`Atualize os dados de "${props.transaction.description}".`}
      triggerClassName="btn btn-ghost btn-sm"
      // don't reset the form when opening the edit modal — keep populated values
      resetFormOnOpen={false}
      dialogClassName="max-w-4xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="update" />
        <input
          type="hidden"
          name="transactionId"
          value={props.transaction.id}
        />
        <TransactionFormFields
          accounts={props.accounts}
          categories={props.categories}
          idPrefix={`transaction-edit-${props.transaction.id}`}
          values={{
            occurredAt: toDateInputValue(props.transaction.occurredAt),
            type: props.transaction.type,
            accountId: props.transaction.accountId,
            categoryId: props.transaction.categoryId ?? "",
            amount: centsToInput(props.transaction.amountCents),
            description: props.transaction.description,
          }}
        />
        <div className="modal-action">
          <ModalCloseButton />
          <button type="submit" className="btn btn-primary">
            Salvar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}
