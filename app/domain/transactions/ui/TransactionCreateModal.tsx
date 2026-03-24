import { Form } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import FormModal, {
  ModalCloseButton,
  closeDialogOnSubmit,
} from "~/ui/FormModal";
import TransactionFormFields from "./TransactionFormFields";

export default function TransactionCreateModal(props: {
  accounts: Account[];
  categories: Category[];
  cards?: Array<{
    id: string;
    brand: string;
    last4: string;
    limitCents?: number | null;
    closingDay?: number;
    dueDay?: number;
    accountId?: string | null;
  }>;
  error?: string;
  today: string;
}) {
  return (
    <FormModal
      dialogId="create_transaction_modal"
      triggerLabel="Criar transação"
      title="Criar transação"
      description="Registre uma receita ou despesa vinculada à household atual."
      triggerClassName="btn btn-primary"
      triggerTestId="transaction-create-open"
      dialogClassName="max-w-4xl"
    >
      <Form method="post" onSubmit={closeDialogOnSubmit} className="space-y-4">
        <input type="hidden" name="intent" value="create" />
        <TransactionFormFields
          accounts={props.accounts}
          categories={props.categories}
          idPrefix="transaction-create"
          values={{
            occurredAt: props.today,
            type: "expense",
            accountId: "",
            categoryId: "",
            amount: "",
            description: "",
          }}
          cards={props.cards}
        />

        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        <div className="modal-action">
          <ModalCloseButton />
          <button
            type="submit"
            className="btn btn-primary"
            data-testid="transaction-create-submit"
          >
            Criar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}
