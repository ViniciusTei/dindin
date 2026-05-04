---
design_system:
  name: "Financeiro"
  description: >
    Household finance management app built for Brazilian households.
    Clean, data-forward, functional — designed to stay out of the way
    of numbers and let the content breathe.
  language: "pt-BR"
  framework: "daisyUI 5 + Tailwind CSS 4"

  themes:
    light:
      name: nord
      description: >
        Nordic light theme — cold blue-grays, white surface, crisp contrast.
        Default for users without dark-mode preference.
      colors:
        base-100: "#eceff4"
        base-200: "#e5e9f0"
        base-300: "#d8dee9"
        base-content: "#2e3440"
        primary: "#5e81ac"
        primary-content: "#ffffff"
        secondary: "#81a1c1"
        secondary-content: "#2e3440"
        accent: "#88c0d0"
        accent-content: "#2e3440"
        neutral: "#4c566a"
        neutral-content: "#eceff4"
        info: "#81a1c1"
        info-content: "#2e3440"
        success: "#a3be8c"
        success-content: "#2e3440"
        warning: "#ebcb8b"
        warning-content: "#2e3440"
        error: "#bf616a"
        error-content: "#ffffff"

    dark:
      name: sunset
      description: >
        Warm dark theme — deep purple-gray backgrounds, peach text,
        amber/orange accents. Activated by system dark-mode preference
        or user toggle.
      colors:
        base-100: "#1d1520"
        base-200: "#221927"
        base-300: "#291f2e"
        base-content: "#f9c4a8"
        primary: "#ff7847"
        primary-content: "#1d0c02"
        secondary: "#ae8db4"
        secondary-content: "#1d0c02"
        accent: "#ffc9b1"
        accent-content: "#1d0c02"
        neutral: "#2a2030"
        neutral-content: "#f9c4a8"
        info: "#7ab6e6"
        info-content: "#1d0c02"
        success: "#7fc6a4"
        success-content: "#1d0c02"
        warning: "#f4c152"
        warning-content: "#1d0c02"
        error: "#e96d7b"
        error-content: "#1d0c02"

  chart_palette:
    description: >
      Fixed sequence used for pie-chart slices and data series.
      Not theme-aware — chosen to be legible on both nord and sunset.
    colors:
      - "#3b82f6"
      - "#06b6d4"
      - "#8b5cf6"
      - "#f59e0b"
      - "#10b981"
      - "#ef4444"
      - "#f97316"
      - "#22c55e"

  typography:
    font_family:
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
    font_source: "Google Fonts — variable weight 100–900, optical size 14–32"
    scale:
      xs: "0.75rem"    # 12px — secondary metadata, footnotes, pie-chart percentages
      sm: "0.875rem"   # 14px — body labels, helper text, alert content
      base: "1rem"     # 16px — default body text
      lg: "1.125rem"   # 18px — (reserved, rarely used directly)
      2xl: "1.5rem"    # 24px — page stat values (balance, expenses)
    weights:
      regular: 400
      medium: 500
      semibold: 600
    line_height:
      tight: 1.25    # card titles, logo lockup
      default: 1.5   # body text

  spacing:
    page_top_margin: "2.5rem"      # mt-10 — all main page content starts here
    content_max_widths:
      narrow: "28rem"              # max-w-md — login, single-form pages
      medium: "42rem"              # max-w-2xl — accounts, single-entity pages
      wide: "64rem"                # max-w-5xl — transactions, dashboard
      full: "72rem"                # max-w-6xl — household details
    page_horizontal_padding: "1rem"  # px-4
    card_gap_sm: "0.5rem"          # gap-2 — within stat cards
    card_gap_md: "0.75rem"         # gap-3 — within standard cards
    card_gap_lg: "1rem"            # gap-4 — between cards in a grid
    grid_gap_lg: "1.5rem"          # gap-6 — between chart cards
    form_field_gap: "0.75rem"      # space-y-3 — between form fields
    sidebar_width_expanded: "16rem"
    sidebar_width_collapsed: "4rem"
    header_height: "3.5rem"        # 56px

  grid:
    description: >
      Responsive two-column is the primary layout unit.
      Forms use a 12-column sub-grid for field alignment.
    columns:
      single: 1
      two: 2          # md:grid-cols-2 — standard card grids
      three: 3        # md:grid-cols-3 — stat triple
      form: 12        # md:grid-cols-12 — form field sizing

  radii:
    box: "var(--radius-box)"      # rounded-box — cards, sidebar links, icon badges, transaction articles
    field: "var(--radius-field)"  # rounded-md  — used occasionally for custom elements
    full: "9999px"                # rounded-full — pie-chart donut hole, legend dots, avatar

  elevation:
    card: "shadow"         # daisyUI default shadow — all cards
    modal: "shadow"        # modal-box inherits card shadow

  borders:
    default_width: "1px"
    sidebar: "border-r border-base-300"
    header: "border-b border-base-300"
    card_variant: "border border-base-300"  # transaction articles, pie-chart circle
    table_footer: "border-t border-base-300"

  opacity:
    secondary_text: 0.7    # opacity-70 — labels, meta, stat subtitles
    dim_text: 0.6          # opacity-60 — menu section titles
    strong_text: 0.8       # opacity-80 — helper paragraphs

  motion:
    description: >
      No custom motion tokens. Theme transitions are instant
      (attribute swap on <html>). Interactivity via native browser
      focus and hover states from daisyUI/Tailwind.

  components:
    button:
      primary: "btn btn-primary"
      ghost: "btn btn-ghost"
      ghost_sm: "btn btn-ghost btn-sm"
      error: "btn btn-error"
      icon_square: "btn btn-ghost btn-square"
      full_width: "btn btn-primary w-full"
      destructive_text: "btn btn-ghost btn-sm text-error"

    card:
      default: "card bg-base-100 shadow"
      body: "card-body gap-2"           # stat cards
      body_md: "card-body gap-4"        # content cards
      title: "card-title"

    transaction_item:
      wrapper: "rounded-box border border-base-300 p-4"
      description: "font-semibold"
      metadata: "grid gap-1 text-sm opacity-70 md:grid-cols-2"

    badge:
      expense: "badge badge-error badge-outline"
      income: "badge badge-success badge-outline"
      role: "badge badge-outline"

    alert:
      error: "alert alert-error"
      success: "alert alert-success"
      warning: "alert alert-warning"

    form_field:
      wrapper: "form-control"
      label: "label"
      label_text: "label-text"
      input: "input input-bordered w-full"
      select: "select select-bordered w-full"

    table:
      wrapper: "overflow-x-auto"
      table: "table table-zebra w-full"

    modal:
      dialog: "modal"
      box: "card bg-base-100 shadow modal-box max-w-2xl"
      box_sm: "card bg-base-100 shadow modal-box max-w-lg"
      actions: "modal-action"
      backdrop: "modal-backdrop"

    sidebar:
      background: "bg-base-200"
      border: "border-r border-base-300"
      nav_icon_badge: "inline-flex h-8 w-8 items-center justify-center rounded-box bg-base-300"
      section_title: "menu-title text-xs uppercase opacity-60"

    stat_card:
      label: "text-sm opacity-70"
      value: "text-2xl font-semibold"
      sublabel: "text-xs opacity-70"
---

# Financeiro — Design Language

## Identity

**Financeiro** is a household expense-sharing and personal finance tracker targeting Brazilian families. The interface is bilingual in intent but fully in **pt-BR**: every label, placeholder, and error message speaks to users naturally. The aesthetic is neutral-professional — data takes center stage, chrome stays minimal.

## Theme Pair

The app ships exactly two themes, toggled with a single header button:

| Attribute | `nord` (light) | `sunset` (dark) |
|-----------|---------------|-----------------|
| Character | Cool, crisp, Nordic | Warm, muted, cozy |
| Base background | Off-white (#eceff4) | Deep purple-gray (#1d1520) |
| Primary accent | Frost blue (#5e81ac) | Warm orange (#ff7847) |
| Text | Arctic night (#2e3440) | Warm peach (#f9c4a8) |

The chosen theme is written to `localStorage` under the key `financeiro.theme`. A blocking inline script in `<head>` reads it before first paint to eliminate flash-of-wrong-theme.

## Layout Shell

The shell uses a CSS grid with **5 columns × 5 rows**:

```
[sidebar 16rem | header span 4 cols         ]
[sidebar        | main content area span 4×4]
```

The sidebar collapses to **4 rem** (icon-only mode) via a toggle button in the header. Both states are handled by swapping a single Tailwind class string on the root grid — no JavaScript animation.

- **Sidebar** (`bg-base-200`, `border-r border-base-300`): logo lockup, top-level navigation, active-household sub-navigation, and a logout button at the bottom.
- **Header** (`bg-base-100`, `border-b border-base-300`, `h-14`): sidebar toggle, username display, theme toggle, offline badge.
- **Main** (`overflow-y-auto`): scrollable content area, always starts with `mt-10 mx-auto px-4` and a `max-w-*` cap.

## Pages and Content Width

Pages use a centered, max-width container that narrows based on content density:

- **Login / Setup / single-form**: `max-w-md` — keeps focus tight
- **Accounts / change-password**: `max-w-2xl` — moderate list
- **Transactions / Dashboard**: `max-w-5xl` — room for charts and tables side-by-side
- **Household detail**: `max-w-6xl` — widest, fits a 3-column stat row + 2-column charts

All page headings use `text-2xl font-semibold`, paired with a right-aligned action button (`btn btn-primary`) using `flex items-center justify-between gap-4`.

## Card Grid

The primary layout unit is a **2-column responsive grid** (`grid gap-4 md:grid-cols-2`). For chart pairs the gap increases to `gap-6`. Stat triples use `md:grid-cols-3`.

Every data card is `card bg-base-100 shadow` with `card-body gap-2` (for compact stat cards) or `gap-4` (for content cards). There is no `card-border` variant in use — the shadow alone defines elevation.

## Navigation Icons

Nav icons sit inside a **8×8 rounded-box badge** (`inline-flex h-8 w-8 items-center justify-center rounded-box bg-base-300`). This gives each icon a slight container lift in sidebar-list context without using an outline or border.

Household sub-navigation items are indented (`pl-6`) and visually subordinate — same icon badge, same link style, just shifted right.

## Forms

Forms are built on daisyUI's `form-control` + `label` + `input-bordered` pattern, always `w-full`. Complex forms (transaction creation) use a **12-column sub-grid** (`grid grid-cols-1 gap-3 md:grid-cols-12`) with `md:col-span-3/6/12` to create aligned, proportional field rows.

The standard field rhythm is `space-y-3`. Modals place the submit/cancel pair in `modal-action`. Destructive delete flows use `btn btn-error`; rename/secondary flows use `btn btn-ghost btn-sm`.

## Modals

All dialogs use the native `<dialog>` HTML element with `dialog.showModal()`. The box is styled as `card bg-base-100 shadow modal-box max-w-2xl` (or `max-w-lg` for confirmations), giving modals the same visual card language as page content. A `<form method="dialog">` backdrop closes on outside click.

## Transaction Cards

Individual transactions render as `<article>` elements with `rounded-box border border-base-300 p-4`. Inside, the layout is `flex-col md:flex-row` — stacked on mobile, side-by-side on desktop with the action buttons right-aligned. The transaction type badge is `badge badge-error badge-outline` (expense) or `badge badge-success badge-outline` (income).

## Tables

Tables use `table table-zebra w-full` inside `overflow-x-auto`. Column headers are plain `<th>`, with the actions column right-aligned (`text-right`). The total row sits below the `</table>` as a `flex items-center justify-between` div with `border-t border-base-300 pt-3`.

## Feedback and Status

- **Errors**: `<div role="alert" class="alert alert-error">` — appears inline, near the relevant form
- **Success**: `<div role="status" class="alert alert-success">` — same position, same size
- **Offline**: `badge badge-warning` in the header — non-blocking, informational
- Empty states: plain `<p class="opacity-70">Nenhum…</p>` — no illustration, no heavy UI

## Data Visualization

Charts are implemented in **pure CSS/SVG without a charting library**:

- **Pie chart**: CSS `conic-gradient` on a `h-64 w-64 rounded-full` div, with an absolute-positioned donut hole (`inset-[24%] rounded-full bg-base-100`). Color slices use the fixed 8-color `EXPENSE_PIE_COLORS` palette.
- **Income/expense trend**: SVG polyline chart rendered directly in React.

The chart color palette (`#3b82f6`, `#06b6d4`, `#8b5cf6`, `#f59e0b`, `#10b981`, `#ef4444`, `#f97316`, `#22c55e`) is fixed — not theme-aware — but selected to contrast on both light and dark backgrounds.

## Typography Conventions

- **Page title**: `text-2xl font-semibold`
- **Card title**: `card-title` (daisyUI — bold, slightly larger)
- **Stat value**: `text-2xl font-semibold` — matches page title weight/size for visual rhythm
- **Stat label**: `text-sm opacity-70`
- **Meta / helper text**: `text-sm opacity-70` or `text-xs opacity-70`
- **Link in prose**: `link link-primary`
- **Secondary descriptions**: `mt-1 text-sm opacity-70` (in modal headers)
- **Monospaced content** (receipt notes): `font-mono text-sm`

## Opacity for Hierarchy

Rather than a separate muted color token, secondary text is expressed through **opacity on the current text color**:

- `opacity-70` — most secondary text (labels, metadata, sub-descriptions)
- `opacity-60` — menu section titles (even more recessive)
- `opacity-80` — helper paragraphs (slightly less muted)

This approach means secondary text adapts automatically to both nord and sunset without needing separate color definitions.

## Internationalization

Currency is always formatted as **BRL** (`R$ 1.234,56`) using `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. Dates use `pt-BR` locale with long or short month formats. The app never displays raw ISO strings in the UI.

## Accessibility

- All icon-only buttons carry `aria-label` and `title`
- Form inputs with server errors set `aria-invalid="true"` and `aria-describedby` pointing to the error element
- Alerts use `role="alert"` (errors) or `role="status"` (successes)
- Modals carry `aria-labelledby` pointing to the `<h2>` title inside
- The pie chart uses `aria-label` on its container div

## Design Principles

1. **Data first** — numbers and dates are the primary content; decoration serves them, not the other way around.
2. **Flat color, one shadow** — `bg-base-100` + `shadow` defines all cards. No gradients in UI chrome.
3. **Semantic feedback only** — errors/successes speak through daisyUI's alert system; no toast infrastructure.
4. **Theme agnosticism** — all color choices use daisyUI semantic tokens (`base-*`, `primary`, `error`, etc.) so both themes work without overrides.
5. **Responsive but not mobile-first** — the app targets desktop as primary; mobile adjustments exist (`md:flex-row`, `md:grid-cols-2`) but the sidebar shell does not currently collapse to a drawer on small screens.
