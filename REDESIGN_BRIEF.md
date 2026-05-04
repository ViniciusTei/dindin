# Financeiro — Redesign Brief
**Prepared by:** Senior Product Design & Frontend Engineering  
**Date:** 2026-05-03  
**Audience:** Design team, frontend engineers  
**Scope:** Full UI/UX audit with prioritized improvement proposals

---

## Context

Financeiro is a household expense-sharing and personal finance tracker, built for Brazilian families. The app is technically solid — clean architecture, good component structure, full daisyUI 5 + Tailwind CSS 4 stack. The redesign must keep all existing functionality intact while lifting usability, clarity, and visual hierarchy to a level that matches the app's ambition.

The app has two themes (nord/light and sunset/dark) and is in pt-BR. Design proposals must work for both.

---

## 1. Key Usability Issues (Prioritized)

### P1 — Critical

#### 1.1 No active navigation state
The sidebar never indicates which page is currently open. Every nav item looks identical regardless of where the user is. This is the single most disorienting issue — users constantly lose context.

> **Root cause:** `AppShell.tsx` renders `<Link>` items without checking against `location.pathname`.

#### 1.2 Financial amounts have no visual priority
Transaction amounts live inside a 4-cell metadata grid at `text-sm opacity-70` — the same visual weight as "Conta: Nubank" or "Categoria: Mercado". For a finance app, the **amount is the primary datum**. It should be the first thing the eye lands on.

> **Root cause:** `TransactionsPage.tsx` — the amount is `formatBRL(displayCents)` inline in a flat `<div>` grid.

#### 1.3 No search or filter on transactions
There is no way to filter by type (expense/income), category, account, date range, or description. As the list grows, the page becomes unusable. This is a hard constraint today.

> **Root cause:** Feature not implemented. Loader only returns all transactions for the current month.

#### 1.4 Month navigation requires sequential clicking
`MonthSelect` only supports prev/next arrows. Jumping 6 months back requires 6 clicks. There is no month/year picker. For historical review — which is the core use case — this is a significant friction point.

> **Root cause:** `MonthSelect.tsx` — only `previousLink` and `nextLink` props, no picker.

---

### P2 — High

#### 2.1 Sidebar navigation hierarchy is invisible
Top-level items (Dashboard, Rateios, Contas…) and household sub-navigation items look identical. The household switcher is rendered as a plain dropdown between items. There is no visual separation between global navigation and context-sensitive navigation.

#### 2.2 No color coding for positive/negative values
Positive and negative balances render in `base-content` (same color). Users must read every value to understand direction. Green/red semantic coloring is a universal financial UI convention — its absence adds cognitive overhead on every number the user reads.

#### 2.3 Empty states give no direction
All empty states are `<p class="opacity-70">Nenhuma transação.</p>`. No action prompt, no illustration, no explanation of what to do next. First-run experience is cold. The user creates an account and stares at opacity-70 text.

#### 2.4 Feedback loop after mutations is slow
Errors and successes render as inline alerts that require a full page reload to appear. There is no pending state on submit buttons — the form goes silent and the browser just waits. Delete actions especially feel broken: nothing visible happens until the page refreshes.

#### 2.5 Sidebar collapse button uses typographic characters
The collapse/expand toggle renders literal `«` and `»` text characters, while the rest of the app uses Remixicon icons throughout. This is the only icon in the app that isn't an icon.

---

### P3 — Medium

#### 3.1 Card surface strategy is inconsistent
- Transaction articles: `rounded-box border border-base-300` (no background, uses page background)
- Household cards: `rounded-box border border-base-300 bg-base-200` (elevated background)
- Account list container: `bg-base-100` (no border, no shadow, no rounding)
- Households page list wrapper: `bg-base-100 shadow` (no rounding)

Four different surface treatments across equivalent list containers. There is no principled elevation model.

#### 3.2 Modal for every action, including trivial ones
Creating, renaming, and deleting an account or category each require a full modal dialog. For a rename with a single field, an inline row edit would be faster and less disruptive. Modal fatigue builds quickly on management-heavy pages.

#### 3.3 Table action buttons are identical in weight
"Renomear" and "Excluir" use the same `btn btn-ghost btn-sm` style. Only "Excluir" adds `text-error` — a very subtle signal that this action is destructive. A user scanning quickly can easily click the wrong one.

#### 3.4 Date format in transaction list
`toDateInputValue()` returns `YYYY-MM-DD` which is displayed raw in the metadata grid. Brazilian users expect `12 mai.` or `12/05`.

#### 3.5 `membro(s)` pluralization
Household cards display `${household.memberCount} membro(s)`. This is a placeholder-style shortcut that reads like a developer string, not a product string.

#### 3.6 "Rateios" uses a heart icon
`RiHeartFill` maps to the "Rateios" (cost-sharing groups) nav item. A heart icon communicates favorites, wishlist, or relationships — not splitting bills. Users scanning the sidebar have no visual anchor for what this item does.

---

### P4 — Polish

- The pie chart center label says "Total de despesas" but shows the negative amount — `formatBRL(-totalCents)`. The label and sign are confusing in combination.
- `MonthSelect` uses the `join` CSS class but the text label in the middle breaks the button group visually — it's not a `join-item`.
- Charts have no hover interactivity. Hovering a pie slice reveals nothing — no tooltip, no highlight.
- The `DashboardHouseholdsOverview` duplicates the full `HouseholdsPage` card layout pixel-for-pixel. Two separate codepaths to maintain for the same component.
- Transactions and household pages both render the same `HouseholdSummary` card layout — duplicated twice in the codebase.
- No breadcrumb navigation. "Voltar" is a plain link — users relying on browser back button may end up in unexpected states.

---

## 2. UI/UX Improvements with Reasoning

### 2.1 Active navigation state

**Proposal:** Highlight the active nav item with a `bg-base-300` background and a 2px left accent border in `primary` color.

```
Before: all items identical
After:  active item → bg-base-300 + left border-l-2 border-primary
```

**Reasoning:** Navigation is the persistent spatial anchor of the app. Without an active state, users constantly re-read every item to orient themselves. This is a 2-line CSS change with outsized impact.

---

### 2.2 Transaction list — amount as hero

**Proposal:** Restructure each transaction card into a two-column layout:

```
[Description + type badge + date + category]  |  [Amount — large, right-aligned, color-coded]
[Account name + card brand if applicable     ]  |  [Edit | Delete — icon buttons]
```

The amount should be:
- `text-xl font-semibold`
- `text-success` (income) / `text-error` (expense)
- Right-aligned, vertically centered

**Reasoning:** Users open the transactions page to check how much they spent. The amount must be scannable in under 200ms. The current layout buries it in a grid of equally-weighted metadata.

---

### 2.3 Color-code all financial values

**Proposal:** Apply semantic color consistently across all money displays:

| Value | Color token | Context |
|-------|------------|---------|
| Positive / income | `text-success` | Income badges, positive balances, net positive |
| Negative / expense | `text-error` | Expense amounts, negative net |
| Zero / neutral | `base-content` | No direction (zero balance) |
| Label | `opacity-70` | Non-value metadata |

**Reasoning:** Color is the fastest pre-attentive attribute. Users should understand the sign of a value before they read it.

---

### 2.4 Month picker

**Proposal:** Replace the prev/next arrows with a dropdown that shows the last 12 months, keeping prev/next as shortcuts.

```
← [maio 2025 ▾] →
     | mai 2025 |
     | abr 2025 |
     | mar 2025 |
     | ...      |
```

Implemented as a `<details>/<summary>` dropdown or native `<select>`. Requires the route to accept any month param, which it already does.

**Reasoning:** Historical analysis is a primary use case for a finance app. Sequential navigation to reach 6 months ago is unacceptable friction.

---

### 2.5 Meaningful empty states

**Proposal:** Each empty state should have three elements: a muted icon, a headline, and a CTA button.

```
[wallet icon]
Nenhuma transação este mês
[+ Nova transação]
```

Use `opacity-40` for the icon, `text-sm` for the body, and the existing `btn btn-primary` for the CTA.

**Reasoning:** Empty states are the new-user's first experience. They should guide, not abandon.

---

### 2.6 Pending state on form buttons

**Proposal:** Add a loading indicator to submit buttons while navigation is in-flight. React Router's `useNavigation()` hook exposes `navigation.state === "submitting"`.

```jsx
<button disabled={isSubmitting} className="btn btn-primary">
  {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : null}
  Criar
</button>
```

**Reasoning:** Users who click a submit button and see nothing happen will click again, or assume failure. This is especially problematic on slow connections.

---

### 2.7 Destructive action differentiation

**Proposal:** In tables, use an icon-only button for destructive actions, not a text button. Replace `btn btn-ghost btn-sm text-error` trigger with a `btn btn-ghost btn-sm btn-square` with a trash icon. Use a tooltip for label.

**Reasoning:** Visual weight and icon semantics reduce the chance of accidental destructive clicks. The trash icon carries universal meaning.

---

### 2.8 Consistent surface model

**Proposal:** Adopt a three-level surface hierarchy and apply it everywhere:

| Level | Classes | Use |
|-------|---------|-----|
| Page | `bg-base-200` | App background |
| Card | `bg-base-100 rounded-box shadow` | Primary content containers |
| Elevated item | `bg-base-200 rounded-box border border-base-300` | Items within cards (household cards, transaction items) |

Remove all one-off combinations (`bg-base-100 shadow` without rounding, `bg-base-100` without shadow, etc.).

---

### 2.9 Sidebar navigation hierarchy

**Proposal:** Separate the sidebar into two distinct zones:

```
[logo]
─────────────────────
  Global navigation
  (Dashboard, Rateios, Contas, Cartões, Configurações)
─────────────────────
  RATEIO ATIVO      ← section label
  [HouseholdSwitcher]
  Visão geral
  Transações
  Categorias
  Convites (admin)
  Membros (admin)
─────────────────────
  [logout]
```

The section label (`RATEIO ATIVO`) should use `menu-title` styling. The two zones should have a visual separator (`divider`). Household sub-items should be indented and use a lighter icon or no icon badge.

---

## 3. Layout Restructuring Proposals

### 3.1 Mobile — Sidebar → Drawer

**Current:** Sidebar is always present. On small screens, it takes a fixed 4rem even when collapsed.

**Proposed:** Use daisyUI's `drawer` component with `lg:drawer-open`.

```html
<div class="drawer lg:drawer-open">
  <input id="main-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- header with hamburger trigger on mobile -->
    <!-- main content -->
  </div>
  <div class="drawer-side">
    <!-- sidebar -->
  </div>
</div>
```

On mobile, the sidebar becomes an overlay drawer triggered by a hamburger in the header. On `lg+`, it stays pinned. This is a **breaking layout change** — scope it as a dedicated task.

---

### 3.2 Transaction list — grouping by date

**Current:** Flat `space-y-3` list of transaction articles.

**Proposed:** Group transactions by date with a sticky date label:

```
────── 02 maio 2025 ──────
  [transaction]
  [transaction]

────── 30 abril 2025 ──────
  [transaction]
```

Date headers use `divider` or `text-xs uppercase opacity-60`. This requires the loader to pass transactions pre-sorted and the component to group by `occurredAt`.

---

### 3.3 Dashboard — two-zone structure

**Current:** Single scrolling page mixing personal (balances, charts) and household data.

**Proposed:** Two visual zones:

```
┌─────────────────────────────────────────┐
│  RESUMO PESSOAL              [Maio 2025] │
│  [Saldo total]  [Receitas | Despesas | Resultado]
│  [Pie chart]    [Income/Expense trend]   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  RATEIOS ATIVOS                          │
│  [Household cards…]                      │
└─────────────────────────────────────────┘
```

Each zone gets a section heading with `text-sm uppercase opacity-60` and a horizontal divider. The month selector applies only to the personal zone — household cards show current month data.

---

### 3.4 Settings — consolidate into a single page

**Current:** Settings is split into `settings.tsx`, `settings.change-password.tsx`, `settings.delete.tsx` — each navigating away.

**Proposed:** Single settings page with accordion sections or tab navigation for "Conta", "Segurança", "Zona de perigo". All within the same URL.

---

## 4. Quick Wins vs Deeper Refactors

### Quick wins — minimal code change, high visual impact

These can be done in < 1 day each and don't require design mockups to start.

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| Q1 | Active nav state (conditional class on `Link`) | 30 min | High |
| Q2 | Replace `«»` with `RiArrowLeftSLine` / `RiArrowRightSLine` icons | 15 min | Medium |
| Q3 | Color-code transaction amounts (`text-success`/`text-error`) | 1 hr | High |
| Q4 | Color-code all balance/net values on Dashboard and Accounts | 1 hr | High |
| Q5 | Fix `membro(s)` → proper pluralization | 15 min | Low |
| Q6 | Fix date format in transaction list (`toDateInputValue` → `formatDate`) | 30 min | Medium |
| Q7 | Replace heart icon on "Rateios" nav with `RiGroupLine` or `RiTeamLine` | 15 min | Medium |
| Q8 | Add `rounded-box` to missing list containers (HouseholdsPage, AccountsPage) | 30 min | Medium |
| Q9 | Fix pie chart: label "Total" should not say `formatBRL(-x)` with a negative | 20 min | Low |
| Q10 | Add `loading` spinner to submit buttons via `useNavigation()` | 2 hr | High |
| Q11 | Empty state for transactions with CTA button | 1 hr | High |
| Q12 | Destructive action: trash icon + tooltip instead of text button | 1 hr | Medium |

---

### Deeper refactors — require design + scoping

These need mockups, possibly back-end changes, and cross-component coordination.

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| D1 | Mobile drawer navigation | M (3–5 days) | High |
| D2 | Month picker dropdown | S (1–2 days) | High |
| D3 | Transaction date grouping | S (1–2 days) | High |
| D4 | Transaction filter bar (type, category, account) | L (1–2 weeks) | Very High |
| D5 | Consistent card surface model | M (2–3 days) | Medium |
| D6 | Inline editing for rename actions | M (2–3 days) | Medium |
| D7 | Chart hover tooltips (pie slices, bar chart) | M (2–3 days) | Medium |
| D8 | Dashboard two-zone restructure | S (1–2 days) | Medium |
| D9 | Settings page consolidation | S (1 day) | Low |
| D10 | Deduplicate HouseholdSummaryCard component | S (1 day) | Low |

---

## 5. Design Deliverables Requested from the Team

For each section below, the design team should provide:

### 5.1 Component Library (Figma)

Based on daisyUI 5 tokens. Minimum components needed:

- Navigation item (default, active, collapsed states)
- Transaction row (expense, income, with/without card, with/without category)
- Financial stat card (positive, negative, neutral value)
- Household card (admin role, member role, empty)
- Empty state (generic template with icon slot + CTA slot)
- Month picker (open + closed states)
- Filter bar (all filter variants)
- Action button group (primary, secondary, destructive — with icons)
- Toast notification (success, error)

### 5.2 Page Layouts

- Dashboard (desktop + mobile)
- Transactions list with filters (desktop + mobile)
- Sidebar — expanded, collapsed, mobile drawer
- Settings (consolidated)

### 5.3 Design Tokens to Resolve

The current design has two open decisions that need explicit decisions before implementation:

1. **Positive value color:** The `success` token in `nord` theme is a desaturated sage green (`#a3be8c`). In `sunset` it's `#7fc6a4`. Confirm both are sufficiently legible and the right semantic fit for income (vs just "safe/ok").

2. **Amount typography:** Should large amounts (`text-2xl font-semibold`) use the `primary` token or `base-content`? Currently they're `base-content`. Using `primary` would make them scannable but creates tension when the value is negative (primary + error = conflicting signals).

---

## Appendix — Tech Notes for Implementors

- **Active nav:** Use `useLocation().pathname` from `react-router` in `AppShell.tsx`. Compare against `item.to` with `startsWith` (prefix match for nested routes).
- **Pending state:** `useNavigation()` from `react-router` — `navigation.state` is `"submitting"` during action, `"loading"` during loader.
- **Mobile drawer:** daisyUI's `drawer` component requires restructuring the `AppShell` grid. The `drawer-content` div must wrap both the header and the main — test the row grid inside `drawer-content`.
- **Month picker:** The routes already accept `?month=YYYY-MM` params. The picker only needs a UI that generates those URLs.
- **Plural fix:** `${count} ${count === 1 ? "membro" : "membros"}`.
- **Chart tooltip:** The pie chart is a `div` with a `conic-gradient` background — not an SVG. Tooltips require calculating pointer angle relative to the div center and mapping it back to a slice. Consider migrating to SVG `<path>` arcs or a lightweight lib (e.g., Recharts, Nivo) for the next version.
- **Inline editing:** The `FormModal` component abstracts modals but doesn't support inline mode. Rename actions could use a `contenteditable` or a controlled `<input>` that replaces the `<td>` cell — no modal needed.
