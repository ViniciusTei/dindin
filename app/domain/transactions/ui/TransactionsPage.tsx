import { useMemo } from "react";
import { Form, Link, useNavigation } from "react-router";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import type { Transaction } from "~/domain/transactions/entity";
import { formatTransactionDate } from "~/domain/transactions/helpers";
import { formatBRL } from "~/lib/money";
import TransactionCreateModal from "./TransactionCreateModal";
import TransactionEditModal from "./TransactionEditModal";
import TransactionDeleteModal from "./TransactionDeleteModal";

type ActiveFilters = {
  type: string;
  categoryId: string;
  accountId: string;
  q: string;
};

export function TransactionsPage(props: {
  accounts: Account[];
  categories: Category[];
  transactions: Array<Transaction & { accountName?: string }>;
  error?: string;
  ok?: boolean;
  actionOk?: boolean;
  loaderOk?: boolean;
  today: string;
  householdId?: string;
  activeFilters?: ActiveFilters;
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
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, typeof props.transactions>();
    for (const tx of props.transactions) {
      const key = formatTransactionDate(tx.occurredAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    }
    return Array.from(groups.entries());
  }, [props.transactions]);

  const categoryById = useMemo(
    () => new Map(props.categories.map((c) => [c.id, c] as const)),
    [props.categories],
  );

  const af = props.activeFilters ?? { type: "", categoryId: "", accountId: "", q: "" };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <div className="flex gap-2">
          <Link
            to={props.householdId ? `/transactions/receipt?householdId=${props.householdId}` : "/transactions/receipt"}
            className="btn btn-ghost btn-sm"
          >
            Importar nota fiscal
          </Link>
          <TransactionCreateModal
            accounts={props.accounts}
            categories={props.categories}
            error={props.error}
            today={props.today}
            cards={props.cards}
          />
        </div>
      </div>

      {/* Error / Success feedback */}
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

      {/* Filter bar (GET form — server-side filtering) */}
      <Form method="get" className="flex flex-wrap gap-2 items-end">
        <select
          name="type"
          defaultValue={af.type}
          aria-label="Tipo"
          className="select select-sm select-bordered"
        >
          <option value="">Todos os tipos</option>
          <option value="expense">Despesas</option>
          <option value="income">Receitas</option>
        </select>

        <select
          name="categoryId"
          defaultValue={af.categoryId}
          aria-label="Categoria"
          className="select select-sm select-bordered"
        >
          <option value="">Todas as categorias</option>
          <option value="none">Sem categoria</option>
          {props.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          name="accountId"
          defaultValue={af.accountId}
          aria-label="Conta"
          className="select select-sm select-bordered"
        >
          <option value="">Todas as contas</option>
          {props.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <input
          type="search"
          name="q"
          defaultValue={af.q}
          placeholder="Buscar descrição..."
          className="input input-sm input-bordered"
          aria-label="Buscar descrição"
        />

        <button type="submit" className="btn btn-sm btn-primary" disabled={isLoading}>
          {isLoading ? <span className="loading loading-spinner loading-xs" /> : null}
          Filtrar
        </button>

        {(af.type || af.categoryId || af.accountId || af.q) ? (
          <a href="?" className="btn btn-sm btn-ghost">Limpar</a>
        ) : null}
      </Form>

      {/* Transaction list grouped by date */}
      {props.transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 opacity-60">
          <span className="text-4xl">📭</span>
          <p className="text-sm">Nenhuma transação.</p>
          {(af.type || af.categoryId || af.accountId || af.q) ? (
            <p className="text-xs">Tente remover os filtros.</p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groupedByDate.map(([dateKey, txs]) => (
            <div key={dateKey}>
              <div className="text-xs font-semibold uppercase opacity-60 mb-2 px-1">
                {dateKey}
              </div>
              <div className="flex flex-col gap-2">
                {txs.map((tx) => {
                  const category = tx.categoryId ? categoryById.get(tx.categoryId) : null;
                  const isExpense = tx.type === "expense";
                  return (
                    <div
                      key={tx.id}
                      className="card card-compact bg-base-100 shadow-sm border border-base-200"
                    >
                      <div className="card-body flex-row items-center justify-between gap-3">
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{tx.description}</span>
                          <span className="text-xs opacity-60">
                            {tx.accountName ?? "—"}
                            {category ? ` · ${category.name}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-semibold ${isExpense ? "text-error" : "text-success"}`}
                          >
                            {isExpense ? formatBRL(-tx.amountCents) : formatBRL(tx.amountCents)}
                          </span>
                          <TransactionEditModal
                            accounts={props.accounts}
                            categories={props.categories}
                            transaction={tx}
                          />
                          <TransactionDeleteModal transaction={tx} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
