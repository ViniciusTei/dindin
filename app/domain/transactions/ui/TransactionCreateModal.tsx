import { useEffect, useState } from "react";
import { Form, useNavigation } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import FormModal, { ModalCloseButton } from "~/ui/FormModal";
import TransactionFormFields from "./TransactionFormFields";
import type { CreditCard } from "~/db/schema";

export default function TransactionCreateModal(props: {
  accounts: Account[];
  categories: Category[];
  cards?: Array<CreditCard>;
  error?: string;
  today: string;
}) {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (navigation.state === "idle") {
      setIsSubmitting(false);
    }
  }, [navigation.state]);

  const isCreateSubmitting =
    isSubmitting ||
    (navigation.state === "submitting" &&
      navigation.formData?.get("intent") === "create");

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
      <Form
        method="post"
        className="space-y-4"
        onSubmit={() => {
          setIsSubmitting(true);
        }}
      >
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
            disabled={isCreateSubmitting}
          >
            Criar
          </button>
        </div>
      </Form>
    </FormModal>
  );
}
