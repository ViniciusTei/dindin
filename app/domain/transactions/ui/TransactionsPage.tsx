import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import type { Transaction } from "~/domain/transactions/entity";
import { formatBRL } from "~/lib/money";
import { useEffect } from "react";
import TransactionCreateModal from "./TransactionCreateModal";
import TransactionEditModal from "./TransactionEditModal";
import TransactionDeleteModal from "./TransactionDeleteModal";
import { toDateInputValue } from "../helpers";

export function TransactionsPage(props: {
  accounts: Account[];
  categories: Category[];
  transactions: Array<Transaction & { accountName?: string }>;
  error?: string;
  ok?: boolean;
  actionOk?: boolean;
  loaderOk?: boolean;
  today: string;
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
  useEffect(() => {
    if (props.actionOk && !props.loaderOk) {
      const url = new URL(window.location.href);
      url.searchParams.set("ok", "1");
      // navigate to same path with ok=1 so loader runs and shows updated data + success message
      window.location.href = url.pathname + url.search;
    }
  }, [props.actionOk, props.loaderOk]);

  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <TransactionCreateModal
          accounts={props.accounts}
          categories={props.categories}
          error={props.error}
          today={props.today}
          cards={props.cards}
        />
      </div>

      <div className="mt-6 grid gap-6">
        {props.error ? (
          <div role="alert" className="alert alert-error">
            <span>{props.error}</span>
          </div>
        ) : null}

        {props.ok ? (
          <div role="status" className="alert alert-success">
            <span>Salvo.</span>
          </div>
        ) : null}

        <section className="bg-base-100">
          <div className="space-y-4">
            {props.transactions.length === 0 ? (
              <p className="opacity-70">Nenhuma transação.</p>
            ) : (
              <div className="space-y-3">
                {props.transactions.map((t) => {
                  const displayCents =
                    t.type === "expense" ? -t.amountCents : t.amountCents;
                  const categoryName = props.categories.find(
                    (category) => category.id === t.categoryId,
                  )?.name;

                  return (
                    <article
                      key={t.id}
                      className="rounded-box border border-base-300 p-4"
                      data-testid={`transaction-card-${t.id}`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{t.description}</h3>
                            <span
                              className={`badge ${t.type === "expense" ? "badge-error badge-outline" : "badge-success badge-outline"}`}
                            >
                              {t.type === "expense" ? "Despesa" : "Receita"}
                            </span>
                          </div>
                          <div className="grid gap-1 text-sm opacity-70 md:grid-cols-2">
                            <div>Data: {toDateInputValue(t.occurredAt)}</div>
                            <div>Conta: {t.accountName ?? "—"}</div>
                            <div>
                              Categoria: {categoryName ?? "Sem categoria"}
                            </div>
                            <div>Valor: {formatBRL(displayCents)}</div>
                          </div>
                        </div>

                        <div className="flex gap-2 md:justify-end">
                          <TransactionEditModal
                            accounts={props.accounts}
                            categories={props.categories}
                            transaction={t}
                          />
                          <TransactionDeleteModal transaction={t} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
