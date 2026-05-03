# Financeiro — Redesign Design Spec

**Date:** 2026-05-03  
**Source brief:** REDESIGN_BRIEF.md  
**Scope:** Full UI/UX redesign pass — quick wins + deeper refactors (mobile drawer deferred)  
**Approach:** Domain-grouped implementation in 7 groups

---

## Constraints & Principles

- All existing functionality remains intact — this is a UI/UX-only redesign (except filter bar, which adds a new feature)
- Both themes (`nord`/light and `sunset`/dark) must work
- App is in pt-BR — no language changes
- Domain components (`app/domain/**`) must never import third-party UI libraries directly; all external library usage is wrapped in `app/lib/` abstractions
- Mobile drawer navigation (D1) is deferred to a separate task

---

## Group 1: AppShell

**Files affected:** `app/ui/AppShell.tsx`, `app/ui/Icon.tsx`

### Active navigation state (Q1)

- Use `useLocation().pathname` (already imported) to detect the active route
- For Dashboard (`/`): exact match `location.pathname === item.to`
- For all other items: `location.pathname.startsWith(item.to)`
- Active `Link` wrapper gets: `border-l-2 border-primary bg-base-300` added to its className
- The existing `bg-base-300` on the icon `<span>` is removed — the whole row background is the active indicator, not just the icon

### Collapse button (Q2)

- Replace `"»"` / `"«"` text characters with Icon components
- Add `RiMenuFoldLine` and `RiMenuUnfoldLine` to `Icon.tsx` as `"menu-fold"` and `"menu-unfold"`
- Collapsed state → `"menu-unfold"`, expanded state → `"menu-fold"`

### Rateios icon (Q7)

- Add `RiGroupLine` to `Icon.tsx` as `"team"`
- Change `icon: "heart"` → `icon: "team"` for the "Rateios" nav item

### Sidebar hierarchy (2.9)

- Add `<li className="divider my-1 px-3" />` between the global nav list and the "RATEIO ATIVO" section header
- The `menu-title` for "Rateio ativo" is already present — no change needed
- Household sub-items remain `pl-6` indented as-is

---

## Group 2: Transactions Domain

**Files affected:**
- `app/domain/transactions/ui/TransactionsPage.tsx`
- `app/domain/transactions/ui/TransactionDeleteModal.tsx`
- `app/domain/transactions/helpers.ts`
- `app/ui/Icon.tsx`
- `app/ui/MonthSelect.tsx`
- `app/routes/households.$householdId.transactions.tsx` (month picker data)
- `app/routes/home.tsx` (month picker data)

### Transaction card two-column layout (2.2 + Q3 + Q6)

Each transaction `<article>` becomes a two-column flex layout:

**Left column:**
- Description (`font-semibold`)
- Type badge (`badge-error badge-outline` / `badge-success badge-outline`) — unchanged
- Date: `formatDate(t.occurredAt)` → `"12 mai."` format
- Category name (`text-sm opacity-70`)
- Account name (`text-sm opacity-70`)

**Right column (right-aligned):**
- Amount: `text-xl font-semibold` + `text-success` (income) / `text-error` (expense)
- Edit + Delete icon buttons below the amount

### `formatTransactionDate` helper (Q6)

New function in `app/domain/transactions/helpers.ts` (named `formatTransactionDate` to avoid collision with the existing `formatDate` in `~/lib/datetime`):

```ts
export function formatTransactionDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(date);
}
```

Output: `"12 mai."`, `"3 jan."`, etc.

`TransactionsPage` replaces `toDateInputValue(t.occurredAt)` calls with `formatTransactionDate(t.occurredAt)`.

### Empty state (Q11)

Replace `<p className="opacity-70">Nenhuma transação.</p>` with:

```tsx
<div className="flex flex-col items-center gap-3 py-12 text-center">
  <Icon name="wallet" className="h-12 w-12 opacity-40" />
  <p className="text-base-content/70">Nenhuma transação este mês</p>
  <TransactionCreateModal ... />  {/* existing create modal trigger */}
</div>
```

### Destructive action (Q12)

- Add `RiDeleteBin2Line` to `Icon.tsx` as `"trash"`
- `TransactionDeleteModal` trigger changes from `btn btn-ghost btn-sm text-error` with text to `btn btn-ghost btn-sm btn-square text-error` with `<Icon name="trash" />` and `title="Excluir"`
- Same pattern in `AccountsPage` (`AccountDeleteModal`) and `CategoriesPage`

### Submit button loading state (Q10)

In all Form submit buttons inside modals and pages:

```tsx
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";

<button disabled={isSubmitting} className="btn btn-primary">
  {isSubmitting && <span className="loading loading-spinner loading-sm" />}
  Criar
</button>
```

Applied to: transaction create/edit, account create/rename, category create/rename, settings forms.

### Month picker (D2)

`MonthSelect` interface extended:

```ts
interface MonthSelectProps {
  monthLabel: string;
  previousLink: string;
  nextLink: string;
  availableMonths?: Array<{ label: string; href: string }>;
}
```

When `availableMonths` is provided, the center label becomes a `<details>/<summary>` dropdown listing months. Prev/next arrows remain as shortcuts.

Each page loader that uses `MonthSelect` generates the last 12 months array and passes it down.

### Transaction date grouping (D3)

`TransactionsPage` groups transactions client-side by `formatDate(t.occurredAt)`. Renders a sticky date header (`<div className="divider text-xs uppercase opacity-60">`) between groups. No loader changes needed — transactions arrive sorted by date.

---

## Group 3: Transaction Filter Bar (D4)

**Files affected:**
- `app/domain/transactions/ui/TransactionsPage.tsx` (filter bar UI)
- `app/routes/households.$householdId.transactions.tsx` (loader reads filters)
- `app/domain/transactions/usecases/list-transactions.ts` (accepts filters)
- `app/db/repositories/transactions.repo.server.ts` (WHERE clauses)

### Filter bar UI

A `<Form method="get" className="flex flex-wrap gap-3">` rendered above the transaction list with:

| Control | Type | Filter param |
|---------|------|-------------|
| Tipo | `<select>` — Todos / Despesas / Receitas | `?type=expense|income` |
| Categoria | `<select>` populated from `loaderData.categories` | `?categoryId=<id>` |
| Conta | `<select>` populated from `loaderData.accounts` | `?accountId=<id>` |
| Busca | `<input type="search">` | `?q=<text>` |

A "Limpar filtros" `<Link to={basePath}>` resets all params.

Submitting the form updates the URL and the loader re-runs with the new params.

### Loader changes

`households.$householdId.transactions.tsx` loader reads:

```ts
const type = url.searchParams.get("type") || undefined;
const categoryId = url.searchParams.get("categoryId") || undefined;
const accountId = url.searchParams.get("accountId") || undefined;
const q = url.searchParams.get("q") || undefined;
```

Passes `filters: { type, categoryId, accountId, q }` to `listTransactions`.

### `listTransactions` use case

New optional `filters` parameter:

```ts
type TransactionFilters = {
  type?: "expense" | "income";
  categoryId?: string;
  accountId?: string;
  q?: string;
};
```

The repo layer adds SQL WHERE conditions for each non-empty filter. Text search on `q` matches `ILIKE '%q%'` against `description`.

---

## Group 4: Dashboard

**Files affected:**
- `app/domain/dashboard/ui/DashboardSummaryCards.tsx`
- `app/domain/dashboard/ui/DashboardExpensePieCard.tsx`
- `app/domain/dashboard/ui/DashboardIncomeExpenseCard.tsx`
- `app/domain/dashboard/ui/HomeDashboardPage.tsx`
- `app/lib/charts/` (new)

### Color-code financial values (Q4 + 2.3)

`DashboardSummaryCards` and `AccountsPage` apply semantic colors:

| Value | CSS class |
|-------|-----------|
| Positive / income | `text-success` |
| Negative / expense | `text-error` |
| Zero | `text-base-content` |

Helper function in `app/lib/money.ts`:

```ts
export function amountColorClass(cents: number): string {
  if (cents > 0) return "text-success";
  if (cents < 0) return "text-error";
  return "";
}
```

Applied to: `totalBalanceCents`, `monthNetCents` (both use sign), `monthIncomeCents` (always success — pass positive value), `monthExpenseCents` (always error — pass as `amountColorClass(-props.monthExpenseCents)` since it is stored positive), account `currentBalanceCents`.

### Pie chart label fix (Q9)

`DashboardExpensePieCard`: change `formatBRL(-expensePie.totalCents)` → `formatBRL(expensePie.totalCents)`. The amounts are already positive (stored as `expenseCents`). Remove all other negation signs from slice display values.

### Chart library migration (D7)

**Remove:** `react-charts` package  
**Add:** `recharts` package

**New `app/lib/charts/` module:**

```
app/lib/charts/
  BarChart.tsx    — wraps Recharts BarChart with domain-friendly typed props
  PieChart.tsx    — wraps Recharts PieChart with domain-friendly typed props
  index.ts        — re-exports
```

`BarChart` props:
```ts
type BarChartProps = {
  data: Array<{ label: string; series: Array<{ name: string; value: number }> }>;
  formatValue?: (v: number) => string;
  formatLabel?: (v: string) => string;
  dark?: boolean;
  height?: number;
};
```

`PieChart` props:
```ts
type PieChartProps = {
  slices: Array<{ name: string; value: number; color?: string }>;
  formatValue?: (v: number) => string;
  centerLabel?: string;
  height?: number;
};
```

Both components import from `recharts`, handle theming internally, and expose `<Tooltip>` on hover.

`DashboardIncomeExpenseCard` is refactored to import from `~/lib/charts` only.  
`DashboardExpensePieCard` is migrated from CSS conic-gradient to `~/lib/charts/PieChart`.

### Dashboard two-zone restructure (D8)

`HomeDashboardPage` restructured into two visual sections:

```
RESUMO PESSOAL
  [MonthHeader]
  [SummaryCards]
  [BarChart | PieChart]

RATEIOS ATIVOS
  [HouseholdSummaryCards]
```

Each section gets `<h2 className="text-xs uppercase opacity-60 tracking-wider mt-8 mb-3">` heading. A `<div className="divider" />` separates the sections.

---

## Group 5: Global Polish

**Files affected:**
- `app/domain/households/ui/HouseholdsPage.tsx`
- `app/domain/dashboard/ui/DashboardHouseholdsOverview.tsx`
- `app/domain/accounts/ui/AccountsPage.tsx`
- `app/domain/categories/ui/CategoriesPage.tsx`
- All Form components with submit buttons

### `membro(s)` pluralization (Q5)

Change in all household card renders:

```ts
`${household.memberCount} ${household.memberCount === 1 ? "membro" : "membros"}`
```

### Consistent surface model (D5 + Q8)

Three-level hierarchy applied everywhere:

| Level | Classes | Use |
|-------|---------|-----|
| Page | `bg-base-200` | App background (already set via theme) |
| Card | `bg-base-100 rounded-box shadow` | Primary content containers |
| Item | `bg-base-200 rounded-box border border-base-300` | Items within cards |

Fixes:
- `HouseholdsPage` section: add `rounded-box shadow` to the `bg-base-100` container
- `AccountsPage` section: add `rounded-box shadow` to the `bg-base-100` container
- `TransactionsPage` section: add `rounded-box shadow`

---

## Group 6: Settings Consolidation (D9)

**Files affected:**
- `app/routes/settings.tsx` (major rewrite)
- `app/routes/settings.change-password.tsx` (becomes action-only, no UI export)
- `app/routes/settings.delete.tsx` (becomes action-only, no UI export)
- `app/domain/users/ui/ChangePasswordForm.tsx` (reused inline)

### Structure

Single `settings.tsx` page with daisyUI `collapse` accordion sections:

1. **Conta** — shows username (read-only)
2. **Segurança** — inline change password form (posts to `/settings/change-password`)
3. **Zona de perigo** — inline delete account form (posts to `/settings/delete`)

The sub-routes (`settings.change-password.tsx`, `settings.delete.tsx`) keep their `action` functions but remove their UI components. On success they redirect to `/settings?ok=change-password` or `/settings?ok=delete`. On error they redirect to `/settings?error=<message>`. The settings loader reads these params and passes them as `ok` and `error` props to the page component.

---

## Group 7: Deduplication + Inline Editing

### Household summary card deduplication (D10)

**New file:** `app/domain/households/ui/HouseholdSummaryCard.tsx`

Extracts the household card JSX that is duplicated between `DashboardHouseholdsOverview` and `HouseholdsPage`. Both components import and use `HouseholdSummaryCard`.

The component accepts:
```ts
type HouseholdSummaryCardProps = {
  household: HouseholdSummary;
  monthLabel: string;
};
```

### Inline editing for rename (D6)

Applies to `AccountsPage` and `CategoriesPage` rename actions.

**Pattern:**
1. Each row has a pencil icon button (`RiPencilLine` added to Icon.tsx as `"pencil"`)
2. Clicking it sets `editingId` state to the item's ID
3. The name cell becomes a `<Form method="post">` with an `<input defaultValue={item.name}>` + "Salvar" + "Cancelar" buttons
4. On submit, the form posts with `intent="rename"` — same action as the existing modal
5. On cancel, `editingId` is cleared

The existing rename modals (`AccountRenameModal`, category rename modal) are removed.

---

## Implementation Order

The groups are independent and can be executed sequentially:

1. **Group 1** — AppShell (quick wins, foundation)
2. **Group 2** — Transactions domain (core UX improvement)
3. **Group 3** — Transaction filter bar (new feature, biggest scope)
4. **Group 4** — Dashboard + chart migration
5. **Group 5** — Global polish (surface model, pluralization)
6. **Group 6** — Settings consolidation
7. **Group 7** — Deduplication + inline editing

Each group is committed separately with a descriptive commit message.

---

## Out of Scope

- **D1 — Mobile drawer navigation:** Deferred to a separate task (requires full AppShell grid restructure)
- No new pages or routes (except settings consolidation collapses 3→1)
- No changes to domain entities or business logic (except listTransactions filters)
- No changes to auth, session, or database schema
