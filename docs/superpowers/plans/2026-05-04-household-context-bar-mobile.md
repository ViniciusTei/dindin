# HouseholdContextBar Mobile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar uma barra de contexto mobile-only no topo das páginas de rateio mostrando o nome do rateio ativo (com link para /households) e abas de sub-navegação com scroll horizontal.

**Architecture:** Criar o componente `HouseholdContextBar` com `md:hidden` e integrá-lo nas 5 páginas de rateio existentes. Rotas que ainda não expõem `{ householdId, name, role }` no loader recebem ajuste mínimo capturando o retorno de `requireHouseholdAccess` (sem query extra). O componente usa `useLocation()` internamente — sem prop drilling do path atual.

**Tech Stack:** React, React Router v7, Tailwind CSS + DaisyUI, Vitest + React Testing Library.

---

## File Map

**Criar:**
- `app/domain/households/ui/HouseholdContextBar.tsx` — componente + tipo `HouseholdContext`
- `app/domain/households/ui/HouseholdContextBar.test.tsx` — testes unitários

**Modificar (páginas de UI):**
- `app/domain/households/ui/HouseholdDetailsPage.tsx` — renderizar `<HouseholdContextBar>`
- `app/domain/households/ui/HouseholdManagePage.tsx` — renderizar `<HouseholdContextBar>`
- `app/domain/categories/ui/CategoriesPage.tsx` — receber prop `household` + renderizar barra
- `app/domain/invites/ui/InvitePage.tsx` — receber prop `household` + renderizar barra
- `app/domain/transactions/ui/TransactionsPage.tsx` — receber prop `householdContext` + renderizar barra

**Modificar (rotas — loaders):**
- `app/routes/households.$householdId.categories.tsx` — capturar retorno de `requireHouseholdAccess` e expor `householdContext`
- `app/routes/households.$householdId.invite.tsx` — capturar retorno de `requireHouseholdAdmin` e expor `householdContext`
- `app/routes/households.$householdId.transactions.tsx` — capturar retorno de `requireHouseholdAccess` e expor `householdContext`

---

## Task 1: Criar o componente `HouseholdContextBar`

**Files:**
- Create: `app/domain/households/ui/HouseholdContextBar.tsx`
- Create: `app/domain/households/ui/HouseholdContextBar.test.tsx`

- [ ] **Step 1.1: Escrever os testes (failing)**

Crie `app/domain/households/ui/HouseholdContextBar.test.tsx` com o conteúdo:

```tsx
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { HouseholdContextBar } from "./HouseholdContextBar";

function renderAt(ui: ReactElement, path: string) {
  const router = createMemoryRouter(
    [{ path: "*", element: ui }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

const memberHousehold = { householdId: "hh_1", name: "Casa do João", role: "member" as const };
const adminHousehold = { householdId: "hh_1", name: "Casa do João", role: "admin" as const };

describe("HouseholdContextBar", () => {
  it("renderiza o nome do rateio", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    expect(screen.getByText("Casa do João")).toBeInTheDocument();
  });

  it("nome do rateio é link para /households", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    const link = screen.getByRole("link", { name: /rateio: casa do joão/i });
    expect(link).toHaveAttribute("href", "/households");
  });

  it("tem classe md:hidden na raiz para ocultar no desktop", () => {
    const { container } = renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1",
    );
    expect(container.firstChild).toHaveClass("md:hidden");
  });

  it("marca Visão geral como ativa na rota exata do household", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    expect(screen.getByRole("link", { name: "Visão geral" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não marca Visão geral como ativa em sub-rota", () => {
    renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1/transactions",
    );
    expect(screen.getByRole("link", { name: "Visão geral" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marca Transações como ativa em /households/hh_1/transactions", () => {
    renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1/transactions",
    );
    expect(screen.getByRole("link", { name: "Transações" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Categorias como ativa em /households/hh_1/categories", () => {
    renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1/categories",
    );
    expect(screen.getByRole("link", { name: "Categorias" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não exibe abas Convites e Membros para membro", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    expect(screen.queryByRole("link", { name: "Convites" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Membros" })).not.toBeInTheDocument();
  });

  it("exibe abas Convites e Membros para admin", () => {
    renderAt(<HouseholdContextBar household={adminHousehold} />, "/households/hh_1");
    expect(screen.getByRole("link", { name: "Convites" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Membros" })).toBeInTheDocument();
  });

  it("marca Convites como ativa para admin em /households/hh_1/invite", () => {
    renderAt(
      <HouseholdContextBar household={adminHousehold} />,
      "/households/hh_1/invite",
    );
    expect(screen.getByRole("link", { name: "Convites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Membros como ativa para admin em /households/hh_1/manage", () => {
    renderAt(
      <HouseholdContextBar household={adminHousehold} />,
      "/households/hh_1/manage",
    );
    expect(screen.getByRole("link", { name: "Membros" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
```

- [ ] **Step 1.2: Confirmar que os testes falham**

```bash
npx vitest run app/domain/households/ui/HouseholdContextBar.test.tsx
```

Resultado esperado: FAIL — `Cannot find module './HouseholdContextBar'`

- [ ] **Step 1.3: Implementar o componente**

Crie `app/domain/households/ui/HouseholdContextBar.tsx`:

```tsx
import { Link, useLocation } from "react-router";

import Icon from "~/ui/Icon";

export type HouseholdContext = {
  householdId: string;
  name: string;
  role: "admin" | "member";
};

type TabItem = {
  to: string;
  label: string;
  exact?: boolean;
  adminOnly?: boolean;
};

function isTabActive(tab: TabItem, currentPath: string): boolean {
  if (tab.exact) return currentPath === tab.to;
  return currentPath.startsWith(tab.to);
}

export function HouseholdContextBar({ household }: { household: HouseholdContext }) {
  const { pathname } = useLocation();

  const tabs: TabItem[] = [
    { to: `/households/${household.householdId}`, label: "Visão geral", exact: true },
    { to: `/households/${household.householdId}/transactions`, label: "Transações" },
    { to: `/households/${household.householdId}/categories`, label: "Categorias" },
    { to: `/households/${household.householdId}/invite`, label: "Convites", adminOnly: true },
    { to: `/households/${household.householdId}/manage`, label: "Membros", adminOnly: true },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || household.role === "admin");

  return (
    <div className="md:hidden border-b border-base-300 bg-base-100">
      <div className="px-4 pt-3 pb-1">
        <Link
          to="/households"
          className="flex items-center gap-1.5 text-sm font-semibold opacity-80 hover:opacity-100"
          aria-label={`Rateio: ${household.name}. Toque para trocar.`}
        >
          <Icon name="team" className="h-4 w-4 shrink-0" />
          <span className="truncate">{household.name}</span>
        </Link>
      </div>
      <nav
        className="flex overflow-x-auto px-3 scrollbar-none"
        aria-label="Navegação do rateio"
      >
        {visibleTabs.map((tab) => {
          const active = isTabActive(tab, pathname);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={[
                "shrink-0 px-3 py-2 text-sm border-b-2 transition-colors whitespace-nowrap",
                active
                  ? "border-primary text-primary font-medium"
                  : "border-transparent opacity-60 hover:opacity-90",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

- [ ] **Step 1.4: Confirmar que os testes passam**

```bash
npx vitest run app/domain/households/ui/HouseholdContextBar.test.tsx
```

Resultado esperado: 12 testes PASS

- [ ] **Step 1.5: Rodar toda a suite para garantir nada quebrou**

```bash
npx vitest run
```

Resultado esperado: todos os testes passando (100 anteriores + 12 novos = 112)

- [ ] **Step 1.6: Commit**

```bash
git add app/domain/households/ui/HouseholdContextBar.tsx app/domain/households/ui/HouseholdContextBar.test.tsx
git commit -m "feat: add HouseholdContextBar component for mobile household context

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2: Integrar nas páginas que já têm `household` completo

**Files:**
- Modify: `app/domain/households/ui/HouseholdDetailsPage.tsx`
- Modify: `app/domain/households/ui/HouseholdManagePage.tsx`

Estas páginas já recebem `household` com `householdId`, `name` e `role` — sem mudança de rota necessária.

- [ ] **Step 2.1: Atualizar `HouseholdDetailsPage`**

Em `app/domain/households/ui/HouseholdDetailsPage.tsx`, adicione o import e envolva o retorno com Fragment:

```tsx
import { Link } from "react-router";

import { DashboardExpensePieCard } from "~/domain/dashboard/ui/DashboardExpensePieCard";
import type { HouseholdDetails } from "~/domain/households/entity";
import { HouseholdContextBar } from "~/domain/households/ui/HouseholdContextBar";
import { HouseholdExpenseTrendCard } from "~/domain/households/ui/HouseholdExpenseTrendCard";
import MonthSelect from "~/ui/MonthSelect";
import { formatBRL } from "~/lib/money";
import { formatDate } from "~/lib/datetime";

function formatShareBps(shareBps: number): string {
  return `${(shareBps / 100).toFixed(2).replace(".", ",")}%`;
}

export function HouseholdDetailsPage(props: { household: HouseholdDetails }) {
  return (
    <>
      <HouseholdContextBar household={props.household} />
      <main className="mx-auto mt-10 max-w-6xl px-4">
        {/* conteúdo existente sem alterações */}
```

O restante do componente (`<div>` com header, grid de cards, tabela de membros) permanece idêntico ao atual — apenas envolva com `<>...</>` e adicione `<HouseholdContextBar>` antes do `<main>`.

- [ ] **Step 2.2: Atualizar `HouseholdManagePage`**

Em `app/domain/households/ui/HouseholdManagePage.tsx`, mesma abordagem — adicione import e envolva com Fragment:

```tsx
import { HouseholdContextBar } from "~/domain/households/ui/HouseholdContextBar";

// Dentro da função HouseholdManagePage:
return (
  <>
    <HouseholdContextBar household={props.household} />
    <main className="mx-auto mt-10 max-w-6xl px-4">
      {/* conteúdo existente sem alterações */}
```

- [ ] **Step 2.3: Rodar testes**

```bash
npx vitest run
```

Resultado esperado: todos os 112 testes passando

- [ ] **Step 2.4: Commit**

```bash
git add app/domain/households/ui/HouseholdDetailsPage.tsx app/domain/households/ui/HouseholdManagePage.tsx
git commit -m "feat: add HouseholdContextBar to HouseholdDetailsPage and HouseholdManagePage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3: Rota e página de Categorias

**Files:**
- Modify: `app/routes/households.$householdId.categories.tsx`
- Modify: `app/domain/categories/ui/CategoriesPage.tsx`

- [ ] **Step 3.1: Atualizar o loader de categorias**

Em `app/routes/households.$householdId.categories.tsx`, capture o retorno de `requireHouseholdAccess` no loader e exponha `householdContext`:

```ts
export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  const household = await requireHouseholdAccess({ userId, householdId });

  const categories = await listCategories({ categoriesRepo, householdId });
  return {
    categories,
    householdContext: {
      householdId: household.householdId,
      name: household.name,
      role: household.role,
    },
  };
}
```

O `action` não precisa de alteração.

- [ ] **Step 3.2: Atualizar o componente de rota para passar `householdContext`**

No final do arquivo `app/routes/households.$householdId.categories.tsx`, atualize o componente default:

```tsx
export default function HouseholdCategories({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <CategoriesPage
      categories={loaderData.categories}
      household={loaderData.householdContext}
      error={actionData?.error}
      ok={actionData?.ok}
    />
  );
}
```

- [ ] **Step 3.3: Atualizar `CategoriesPage` para aceitar e renderizar a barra**

Em `app/domain/categories/ui/CategoriesPage.tsx`, adicione o import e o prop `household`:

```tsx
import { HouseholdContextBar, type HouseholdContext } from "~/domain/households/ui/HouseholdContextBar";

export function CategoriesPage(props: {
  categories: Category[];
  error?: string;
  ok?: boolean;
  household?: HouseholdContext;
}) {
  // ...

  return (
    <>
      {props.household ? <HouseholdContextBar household={props.household} /> : null}
      <div className="p-4 max-w-2xl">
        {/* restante do conteúdo existente sem alterações */}
```

- [ ] **Step 3.4: Rodar testes**

```bash
npx vitest run
```

Resultado esperado: todos os 112 testes passando

- [ ] **Step 3.5: Commit**

```bash
git add app/routes/households.\$householdId.categories.tsx app/domain/categories/ui/CategoriesPage.tsx
git commit -m "feat: add HouseholdContextBar to CategoriesPage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4: Rota e página de Convites

**Files:**
- Modify: `app/routes/households.$householdId.invite.tsx`
- Modify: `app/domain/invites/ui/InvitePage.tsx`

- [ ] **Step 4.1: Atualizar o loader de convites**

Em `app/routes/households.$householdId.invite.tsx`, capture o retorno de `requireHouseholdAdmin` no loader:

```ts
export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  const household = await requireHouseholdAdmin({ userId, householdId });

  return {
    origin: getRequestOrigin(request),
    householdContext: {
      householdId: household.householdId,
      name: household.name,
      role: household.role,
    },
  };
}
```

O `action` não precisa de alteração (já chama `requireHouseholdAdmin` separadamente).

- [ ] **Step 4.2: Atualizar o componente de rota**

```tsx
export default function HouseholdInvite({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <InvitePage
      origin={loaderData.origin}
      household={loaderData.householdContext}
      token={actionData?.token}
      expiresAt={actionData?.expiresAt}
    />
  );
}
```

- [ ] **Step 4.3: Atualizar `InvitePage`**

Em `app/domain/invites/ui/InvitePage.tsx`, adicione o import e o prop `household`:

```tsx
import { Form, Link } from "react-router";

import { HouseholdContextBar, type HouseholdContext } from "~/domain/households/ui/HouseholdContextBar";

export function InvitePage(props: {
  origin: string;
  token?: string;
  expiresAt?: string;
  household?: HouseholdContext;
}) {
  const link = props.token ? `${props.origin}/join/${props.token}` : null;

  return (
    <>
      {props.household ? <HouseholdContextBar household={props.household} /> : null}
      <main className="mx-auto mt-10 max-w-2xl px-4">
        {/* restante do conteúdo existente sem alterações */}
```

- [ ] **Step 4.4: Rodar testes**

```bash
npx vitest run
```

Resultado esperado: todos os 112 testes passando

- [ ] **Step 4.5: Commit**

```bash
git add app/routes/households.\$householdId.invite.tsx app/domain/invites/ui/InvitePage.tsx
git commit -m "feat: add HouseholdContextBar to InvitePage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5: Rota e página de Transações

**Files:**
- Modify: `app/routes/households.$householdId.transactions.tsx`
- Modify: `app/domain/transactions/ui/TransactionsPage.tsx`

- [ ] **Step 5.1: Atualizar o loader de transações**

Em `app/routes/households.$householdId.transactions.tsx`, capture o retorno de `requireHouseholdAccess`:

```ts
export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const householdId = String(params.householdId ?? "");
  const household = await requireHouseholdAccess({ userId, householdId });

  // ... restante do loader sem alterações ...

  return {
    accounts,
    categories,
    transactions: transactions.map((transaction) => ({
      ...transaction,
      accountName: accountNameById.get(transaction.accountId),
    })),
    today: todayISODate(),
    cards: viewCards,
    warning,
    ok,
    householdId,
    activeFilters: {
      type: typeParam ?? "",
      categoryId: categoryIdParam ?? "",
      accountId: accountIdParam ?? "",
      q: qParam ?? "",
    },
    householdContext: {
      householdId: household.householdId,
      name: household.name,
      role: household.role,
    },
  };
}
```

- [ ] **Step 5.2: Atualizar o componente de rota**

```tsx
export default function HouseholdTransactions({ loaderData, actionData }: Route.ComponentProps) {
  return (
    <TransactionsPage
      accounts={loaderData.accounts}
      categories={loaderData.categories}
      transactions={loaderData.transactions}
      today={loaderData.today}
      error={actionData?.error ?? loaderData?.warning}
      ok={Boolean(loaderData?.ok)}
      actionOk={Boolean(loaderData?.ok)}
      loaderOk={Boolean(loaderData?.ok)}
      cards={loaderData.cards}
      householdId={loaderData.householdId}
      activeFilters={loaderData.activeFilters}
      householdContext={loaderData.householdContext}
    />
  );
}
```

- [ ] **Step 5.3: Atualizar `TransactionsPage` para aceitar e renderizar a barra**

Em `app/domain/transactions/ui/TransactionsPage.tsx`, adicione o import e o prop `householdContext`:

```tsx
import { HouseholdContextBar, type HouseholdContext } from "~/domain/households/ui/HouseholdContextBar";

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
  householdContext?: HouseholdContext;
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
```

No return do componente, adicione a barra antes do `<div className="p-4 ...">`:

```tsx
  return (
    <>
      {props.householdContext ? (
        <HouseholdContextBar household={props.householdContext} />
      ) : null}
      <div className="p-4 flex flex-col gap-4">
        {/* restante do conteúdo existente sem alterações */}
```

Feche o `<>` ao final (antes do último `)`).

- [ ] **Step 5.4: Rodar testes**

```bash
npx vitest run
```

Resultado esperado: todos os 112 testes passando (os testes de `TransactionsPage` não passam `householdContext`, o que é válido já que o prop é opcional)

- [ ] **Step 5.5: Commit**

```bash
git add app/routes/households.\$householdId.transactions.tsx app/domain/transactions/ui/TransactionsPage.tsx
git commit -m "feat: add HouseholdContextBar to TransactionsPage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Verificação Final

- [ ] **Rodar a suite completa uma última vez**

```bash
npx vitest run
```

Resultado esperado: 112 testes passando (100 originais + 12 novos do HouseholdContextBar)

- [ ] **Verificar visualmente no browser (opcional)**

Abrir a aplicação no mobile (ou DevTools com viewport mobile) e navegar para `/households/:id/transactions`. Confirmar:
1. Barra com nome do rateio aparece no topo
2. Aba "Transações" está ativa (borda e cor)
3. Toque no nome navega para `/households`
4. Abas Convites e Membros visíveis apenas para admin
5. No desktop, barra está oculta

