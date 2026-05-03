# Mobile UX Improvements — Design Spec

**Date:** 2026-05-03  
**Status:** Approved

## Problem

The app has no mobile-optimized navigation. The desktop sidebar is unusable on small screens, and modals lack a mobile-friendly presentation (bottom sheet). This spec covers two improvements: a mobile bottom navigation bar and a responsive modal/drawer primitive, plus a sidebar refactor for code clarity.

## Scope

- Extract the desktop sidebar into its own component (`DesktopSidebar`)
- Add a mobile bottom navigation bar (`MobileBottomNav`)
- Create a responsive modal primitive (`ResponsiveModal`) that renders a centered modal on desktop and a bottom sheet on mobile
- Refactor `FormModal` to delegate to `ResponsiveModal` (zero breaking changes for consumers)

Out of scope: household-context items in mobile nav, profile/user menu on mobile, transitions/animations beyond DaisyUI defaults.

---

## Architecture

### New Files

| File | Responsibility |
|------|---------------|
| `app/ui/DesktopSidebar.tsx` | Desktop lateral sidebar, extracted from `AppShell`. Receives all nav props. Handles collapse state display. |
| `app/ui/DesktopSidebar.test.tsx` | Unit tests for sidebar (absorbs existing AppShell sidebar tests). |
| `app/ui/MobileBottomNav.tsx` | Fixed bottom navigation bar. Visible only on `< md`. Pure presentational component. |
| `app/ui/MobileBottomNav.test.tsx` | Unit tests for bottom nav. |
| `app/ui/ResponsiveModal.tsx` | Responsive modal primitive. Uses `<dialog>` natively with DaisyUI `modal-bottom sm:modal-middle` for bottom-sheet behavior on mobile. |
| `app/ui/ResponsiveModal.test.tsx` | Unit tests for responsive modal. |

### Modified Files

| File | Changes |
|------|---------|
| `app/ui/AppShell.tsx` | Uses `DesktopSidebar` and `MobileBottomNav`. Hides sidebar on mobile. Adds bottom padding to `<main>` on mobile. Becomes a layout orchestrator. |
| `app/ui/FormModal.tsx` | Delegates rendering to `ResponsiveModal`. Keeps the same public API — zero breaking changes. |
| `app/ui/AppShell.test.tsx` | Simplified: tests layout composition, offline badge, username display. Sidebar-specific tests move to `DesktopSidebar.test.tsx`. |

---

## Component Designs

### `DesktopSidebar`

The `AppShellHousehold` and `AppShellUser` types currently defined privately in `AppShell.tsx` must be exported so `DesktopSidebar` can import them.

Props:
```ts
type DesktopSidebarProps = {
  isSidebarCollapsed: boolean;
  navItems: Array<{ to: string; label: string; icon: IconName }>;
  householdNavItems: Array<{ to: string; label: string; icon: IconName }>;
  activeHousehold: AppShellHousehold | null;
  households: AppShellHousehold[];
  preferredHouseholdId: string | null;
  defaultHouseholdId: string | null;
  currentPath: string;
  onActiveHouseholdChange: (id: string) => void;
}
```

Renders the existing sidebar markup, unchanged visually. Receives all data from `AppShell` via props. `AppShell` keeps collapse state and passes it down.

### `MobileBottomNav`

Props:
```ts
type MobileBottomNavProps = {
  navItems: Array<{ to: string; label: string; icon: IconName }>;
  currentPath: string;
}
```

- Fixed at bottom: `fixed bottom-0 inset-x-0 md:hidden z-40`
- Background: `bg-base-200 border-t border-base-300`
- Items: `flex justify-around items-center h-16`
- Safe area: `pb-[env(safe-area-inset-bottom)]`
- Active item: `text-primary` (compares `currentPath` starts-with `item.to`, exact match for `/`)
- Each item: icon (24×24) + short label below, wrapped in `<Link>`
- `aria-current="page"` on the active link

### `ResponsiveModal`

API (same as current `FormModal` minus the trigger — `FormModal` keeps the trigger):
```ts
type ResponsiveModalProps = {
  dialogId: string;
  title: string;
  description?: string;
  children: ReactNode;
  dialogClassName?: string;
}
```

Renders a `<dialog>` with DaisyUI class `modal modal-bottom sm:modal-middle`:
- On `sm+` (≥640px): modal appears centered (standard DaisyUI modal)
- On `< sm`: modal appears as bottom sheet, slides up from the bottom

Also exports `openResponsiveModal(dialogId, resetForm)` and `closeResponsiveModal(event)` utilities (replacing `openDialog` / `closeDialogOnSubmit` from `FormModal`).

`ModalCloseButton` moves to (or is re-exported from) `ResponsiveModal.tsx`.

### `FormModal` (after refactor)

Keeps the exact same public API. Internally:
1. Renders the trigger `<button>`
2. Renders `<ResponsiveModal>` with a `<div class="card-body gap-4">` wrapping the title, description, and children

---

## AppShell Layout Changes

Mobile (< md):
- Grid becomes 1-column full width (sidebar hidden)
- `<main>` has `pb-20 md:pb-0` to avoid content being covered by the bottom nav
- `MobileBottomNav` rendered outside the grid, fixed positioning handles placement

Desktop (md+):
- Behavior unchanged

---

## Testing Plan

### `DesktopSidebar.test.tsx`
- Shows admin-only links (invite, manage) for admin role
- Hides admin-only links for member role
- Collapse toggle hides labels and shows only icons
- Shows household nav items only when active household exists
- Hides household items when user has no households

### `MobileBottomNav.test.tsx`
- Renders all 5 nav items with correct labels
- All links point to correct routes
- Active item has `aria-current="page"` for exact `/` route
- Active item has `aria-current="page"` for sub-path matching (e.g. `/accounts/*`)
- Non-active items do not have `aria-current="page"`

### `ResponsiveModal.test.tsx`
- Trigger button calls `showModal` on the dialog
- Title and optional description are rendered
- `resetFormOnOpen: true` triggers `form.reset()` on open
- `ModalCloseButton` closes the nearest dialog

### `AppShell.test.tsx` (simplified)
- Renders children in `<main>`
- Renders `MobileBottomNav` (spot-check one link)
- Renders `DesktopSidebar`
- Shows offline badge on `window.dispatchEvent(new Event("offline"))`
- Shows username in header

---

## Constraints

- DaisyUI v5 + Tailwind CSS v4 — use existing design system classes
- No new dependencies
- `FormModal` public API must not change (no breaking changes)
- Tests use Vitest + `@testing-library/react` following existing patterns in `AppShell.test.tsx`
