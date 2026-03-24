import React, { useEffect, useState } from "react";
import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import type { Transaction } from "~/domain/transactions/entity";

type TransactionFormValues = {
  occurredAt: string;
  type: Transaction["type"];
  accountId: string;
  categoryId: string;
  amount: string;
  description: string;
};

export default function TransactionFormFields(props: {
  accounts: Account[];
  categories: Category[];
  values: TransactionFormValues;
  idPrefix: string;
  cards?: Array<{
    id: string;
    brand: string;
    last4: string;
    limitCents?: number | null;
    closingDay?: number;
    dueDay?: number;
    accountId?: string | null;
  }>;
}) {
  const [accountId, setAccountId] = useState<string>(props.values.accountId ?? "");
  const [creditCardId, setCreditCardId] = useState<string>("");

  useEffect(() => {
    // If a card is selected and it has an associated account, auto-select that account.
    if (creditCardId) {
      const card = props.cards?.find((c) => c.id === creditCardId);
      if (card?.accountId) {
        setAccountId(card.accountId);
      }
    }
    // Intentionally not clearing account when unselecting card to avoid surprising the user.
  }, [creditCardId, props.cards]);

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-occurredAt`}>
          <span className="label-text">Data</span>
        </label>
        <input
          id={`${props.idPrefix}-occurredAt`}
          name="occurredAt"
          type="date"
          defaultValue={props.values.occurredAt}
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-type`}>
          <span className="label-text">Tipo</span>
        </label>
        <select
          id={`${props.idPrefix}-type`}
          name="type"
          className="select select-bordered w-full"
          defaultValue={props.values.type}
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </div>

      <div className="form-control md:col-span-6">
        <label className="label" htmlFor={`${props.idPrefix}-accountId`}>
          <span className="label-text">Conta</span>
        </label>
        <select
          id={`${props.idPrefix}-accountId`}
          name="accountId"
          className="select select-bordered w-full"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        >
          <option value="">Selecione…</option>
          {props.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control md:col-span-6">
        <label className="label" htmlFor={`${props.idPrefix}-categoryId`}>
          <span className="label-text">Categoria</span>
        </label>
        <select
          id={`${props.idPrefix}-categoryId`}
          name="categoryId"
          className="select select-bordered w-full"
          defaultValue={props.values.categoryId}
        >
          <option value="">Sem categoria</option>
          {props.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control md:col-span-6">
        <label className="label" htmlFor={`${props.idPrefix}-creditCardId`}>
          <span className="label-text">Pagamento com cartão</span>
        </label>
        <select
          id={`${props.idPrefix}-creditCardId`}
          name="creditCardId"
          className="select select-bordered w-full"
          value={creditCardId}
          onChange={(e) => setCreditCardId(e.target.value)}
        >
          <option value="">Não (usar conta)</option>
          {props.cards?.map((c) => (
            <option key={c.id} value={c.id}>
              {`${String(c.brand).toUpperCase()} •••• ${c.last4}`}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-installmentsTotal`}>
          <span className="label-text">Parcelas</span>
        </label>
        <input
          id={`${props.idPrefix}-installmentsTotal`}
          name="installmentsTotal"
          type="number"
          defaultValue="1"
          min={1}
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control md:col-span-3">
        <label className="label" htmlFor={`${props.idPrefix}-amount`}>
          <span className="label-text">Valor</span>
        </label>
        <input
          id={`${props.idPrefix}-amount`}
          name="amount"
          defaultValue={props.values.amount}
          placeholder="0,00"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control md:col-span-12">
        <label className="label" htmlFor={`${props.idPrefix}-description`}>
          <span className="label-text">Descrição</span>
        </label>
        <input
          id={`${props.idPrefix}-description`}
          name="description"
          defaultValue={props.values.description}
          placeholder="Ex.: Mercado, Salário, Uber"
          className="input input-bordered w-full"
        />
      </div>
    </div>
  );
}
