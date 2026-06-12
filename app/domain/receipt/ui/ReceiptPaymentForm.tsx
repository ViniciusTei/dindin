import { useState } from "react";
import type { CreditCard } from "~/db/schema";
import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";

type Props = {
  accounts: Account[];
  categories: Category[];
  cards: CreditCard[];
  defaultDate: string;
  defaultNote: string;
  totalCents: number;
};

export function ReceiptPaymentForm({
  accounts,
  categories,
  cards,
  defaultDate,
  defaultNote,
}: Props) {
  const [paymentType, setPaymentType] = useState<"account" | "credit-card">(
    "account",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Granularidade</legend>
          <div className="join">
            <label className="join-item btn has-[:checked]:btn-primary">
              <input
                type="radio"
                name="mode"
                value="single"
                defaultChecked
                className="hidden"
              />
              Uma transação
            </label>
            <label className="join-item btn has-[:checked]:btn-primary">
              <input
                type="radio"
                name="mode"
                value="per-item"
                className="hidden"
              />
              Por item
            </label>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Data</legend>
          <input
            type="date"
            name="date"
            defaultValue={defaultDate}
            required
            className="input w-full"
          />
        </fieldset>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Categoria (opcional)</legend>
          <select name="categoryId" className="select w-full">
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Forma de pagamento</legend>
          <div className="join">
            <label className="join-item btn has-[:checked]:btn-primary">
              <input
                type="radio"
                name="paymentType"
                value="account"
                checked={paymentType === "account"}
                onChange={() => setPaymentType("account")}
                className="hidden"
              />
              Conta
            </label>
            <label className="join-item btn has-[:checked]:btn-primary">
              <input
                type="radio"
                name="paymentType"
                value="credit-card"
                checked={paymentType === "credit-card"}
                onChange={() => setPaymentType("credit-card")}
                className="hidden"
              />
              Cartão
            </label>
          </div>
        </fieldset>
      </div>

      {paymentType === "account" && (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Conta</legend>
          <select name="accountId" className="select w-full" required>
            <option value="">Selecione…</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      {paymentType === "credit-card" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Cartão</legend>
            <select name="creditCardId" className="select w-full" required>
              <option value="">Selecione…</option>
              {cards.map((c) => (
                <option key={c.id} value={c.id}>
                  {`${String(c.nickname).toUpperCase()} •••• `}
                </option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Parcelas</legend>
            <input
              type="number"
              name="installments"
              defaultValue={1}
              min={1}
              max={120}
              className="input w-full"
            />
          </fieldset>
        </div>
      )}

      <fieldset className="fieldset">
        <legend className="fieldset-legend">Observação</legend>
        <textarea
          name="note"
          defaultValue={defaultNote}
          rows={6}
          className="textarea w-full font-mono text-sm"
        />
        <p className="label">Gerada automaticamente — edite se quiser.</p>
      </fieldset>
    </div>
  );
}
