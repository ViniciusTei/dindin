# Mobile UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile bottom navigation bar and a responsive modal/drawer primitive, extracting the desktop sidebar into its own component for code clarity.

**Architecture:** Extract `DesktopSidebar` from `AppShell`, create `MobileBottomNav` (fixed bottom bar, `md:hidden`), and create `ResponsiveModal` (DaisyUI `modal-bottom sm:modal-middle`) which `FormModal` delegates to. `AppShell` becomes a lean layout orchestrator. All existing `FormModal` consumer imports remain unchanged.

**Tech Stack:** React 19, React Router 7, DaisyUI v5, Tailwind CSS v4, Remixicon, Vitest + Testing Library

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `app/ui/ResponsiveModal.tsx` | `<dialog>` primitive with bottom-sheet on mobile; exports `openResponsiveModal`, `closeResponsiveModal`, `ModalCloseButton`, `ResponsiveModal` |
| Create | `app/ui/ResponsiveModal.test.tsx` | Tests for ResponsiveModal, openResponsiveModal, ModalCloseButton |
| Modify | `app/ui/FormModal.tsx` | Delegate rendering to `ResponsiveModal`; re-export `closeDialogOnSubmit` + `ModalCloseButton` for backward compat |
| Create | `app/ui/DesktopSidebar.tsx` | Desktop lateral sidebar extracted from AppShell; exports `AppShellHousehold` type |
| Create | `app/ui/DesktopSidebar.test.tsx` | Sidebar unit tests (migrated from AppShell.test.tsx) |
| Create | `app/ui/MobileBottomNav.tsx` | Fixed bottom nav, `md:hidden`, 5 main items |
| Create | `app/ui/MobileBottomNav.test.tsx` | Tests: items rendered, active state, correct hrefs |
| Modify | `app/ui/AppShell.tsx` | Use DesktopSidebar + MobileBottomNav; import types from DesktopSidebar; responsive grid |
| Modify | `app/ui/AppShell.test.tsx` | Simplify to layout/header tests only; sidebar tests live in DesktopSidebar.test.tsx |

---

## Task 1: Create ResponsiveModal

**Files:**
- Create: `app/ui/ResponsiveModal.tsx`
- Create: `app/ui/ResponsiveModal.test.tsx`

- [ ] **Step 1.1: Write failing tests**

Create `app/ui/ResponsiveModal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ModalCloseButton,
  openResponsiveModal,
  ResponsiveModal,
} from "./ResponsiveModal";

describe("ResponsiveModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it("renderiza título", () => {
    render(
      <ResponsiveModal dialogId="d1" title="Meu Modal">
        <p>conteúdo</p>
      </ResponsiveModal>,
    );
    expect(screen.getByText("Meu Modal")).toBeInTheDocument();
  });

  it("renderiza descrição quando fornecida", () => {
    render(
      <ResponsiveModal dialogId="d2" title="T" description="Desc aqui">
        <div />
      </ResponsiveModal>,
    );
    expect(screen.getByText("Desc aqui")).toBeInTheDocument();
  });

  it("não renderiza elemento de descrição quando omitida", () => {
    render(
      <ResponsiveModal dialogId="d3" title="T">
        <div />
      </ResponsiveModal>,
    );
    expect(screen.queryByText("Desc aqui")).not.toBeInTheDocument();
  });

  it("renderiza children dentro do modal", () => {
    render(
      <ResponsiveModal dialogId="d4" title="T">
        <span data-testid="filho">filho</span>
      </ResponsiveModal>,
    );
    expect(screen.getByTestId("filho")).toBeInTheDocument();
  });
});

describe("openResponsiveModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
  });

  it("chama showModal no dialog com o id fornecido", () => {
    render(
      <ResponsiveModal dialogId="modal-open" title="T">
        <div />
      </ResponsiveModal>,
    );
    openResponsiveModal("modal-open", false);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it("reseta o formulário de conteúdo quando resetForm é true", () => {
    render(
      <ResponsiveModal dialogId="modal-reset" title="T">
        <form>
          <input defaultValue="preenchido" />
        </form>
      </ResponsiveModal>,
    );
    const form = document.querySelector<HTMLFormElement>(
      "#modal-reset form:not([method='dialog'])",
    )!;
    const resetSpy = vi.spyOn(form, "reset");
    openResponsiveModal("modal-reset", true);
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  it("não reseta o formulário quando resetForm é false", () => {
    render(
      <ResponsiveModal dialogId="modal-noreset" title="T">
        <form>
          <input defaultValue="valor" />
        </form>
      </ResponsiveModal>,
    );
    const form = document.querySelector<HTMLFormElement>(
      "#modal-noreset form:not([method='dialog'])",
    )!;
    const resetSpy = vi.spyOn(form, "reset");
    openResponsiveModal("modal-noreset", false);
    expect(resetSpy).not.toHaveBeenCalled();
  });
});

describe("ModalCloseButton", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it("fecha o dialog ao clicar", async () => {
    const user = userEvent.setup();
    render(
      <dialog id="close-test">
        <ModalCloseButton />
      </dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  it("usa texto personalizado quando fornecido", () => {
    render(
      <dialog>
        <ModalCloseButton>Fechar</ModalCloseButton>
      </dialog>,
    );
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
  });

  it("aplica classe personalizada quando fornecida", () => {
    render(
      <dialog>
        <ModalCloseButton className="btn btn-error" />
      </dialog>,
    );
    expect(screen.getByRole("button")).toHaveClass("btn-error");
  });
});
```

- [ ] **Step 1.2: Run tests to verify failure**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS|Error|Cannot find)"
```

Expected: FAIL — `Cannot find module './ResponsiveModal'`

- [ ] **Step 1.3: Implement ResponsiveModal**

Create `app/ui/ResponsiveModal.tsx`:

```tsx
import type { ReactNode } from "react";

type ResponsiveModalProps = {
  dialogId: string;
  title: string;
  description?: string;
  children: ReactNode;
  dialogClassName?: string;
};

export function openResponsiveModal(dialogId: string, resetForm: boolean) {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
  if (!dialog) {
    console.error(`Dialog element "${dialogId}" not found`);
    return;
  }

  if (!dialog.open) {
    dialog.showModal();
  }

  if (!resetForm) return;

  const form = Array.from(dialog.querySelectorAll("form")).find(
    (candidate) => candidate.getAttribute("method") !== "dialog",
  );
  form?.reset();
}

export function closeResponsiveModal(event: { currentTarget: Element }) {
  const dialog = event.currentTarget.closest(
    "dialog",
  ) as HTMLDialogElement | null;
  dialog?.close();
}

export function ModalCloseButton(props: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={props.className ?? "btn"}
      onClick={closeResponsiveModal}
    >
      {props.children ?? "Cancelar"}
    </button>
  );
}

export function ResponsiveModal(props: ResponsiveModalProps) {
  return (
    <dialog
      id={props.dialogId}
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby={`${props.dialogId}-title`}
    >
      <section
        className={`card bg-base-100 shadow modal-box ${props.dialogClassName ?? "max-w-2xl"}`}
      >
        <div className="card-body gap-4">
          <div>
            <h2 id={`${props.dialogId}-title`} className="card-title">
              {props.title}
            </h2>
            {props.description ? (
              <p className="mt-1 text-sm opacity-70">{props.description}</p>
            ) : null}
          </div>
          {props.children}
        </div>
      </section>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
```

- [ ] **Step 1.4: Run tests to verify pass**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS|✓|✗)" | head -30
```

Expected: all `ResponsiveModal.test.tsx` tests pass.

- [ ] **Step 1.5: Commit**

```bash
git add app/ui/ResponsiveModal.tsx app/ui/ResponsiveModal.test.tsx
git commit -m "feat(ui): add ResponsiveModal primitive with bottom-sheet on mobile"
```

---

## Task 2: Refactor FormModal to use ResponsiveModal

**Files:**
- Modify: `app/ui/FormModal.tsx`

- [ ] **Step 2.1: Replace FormModal implementation**

Replace the entire content of `app/ui/FormModal.tsx` with:

```tsx
import type { ReactNode } from "react";

import {
  closeResponsiveModal,
  ModalCloseButton,
  openResponsiveModal,
  ResponsiveModal,
} from "./ResponsiveModal";

export { closeResponsiveModal as closeDialogOnSubmit, ModalCloseButton };

type FormModalProps = {
  dialogId: string;
  triggerLabel: string;
  title: string;
  description?: string;
  children: ReactNode;
  triggerClassName?: string;
  triggerTestId?: string;
  dialogClassName?: string;
  resetFormOnOpen?: boolean;
};

export default function FormModal(props: FormModalProps) {
  return (
    <>
      <button
        type="button"
        className={props.triggerClassName ?? "btn btn-primary"}
        data-testid={props.triggerTestId}
        onClick={() =>
          openResponsiveModal(props.dialogId, props.resetFormOnOpen ?? true)
        }
      >
        {props.triggerLabel}
      </button>
      <ResponsiveModal
        dialogId={props.dialogId}
        title={props.title}
        description={props.description}
        dialogClassName={props.dialogClassName}
      >
        {props.children}
      </ResponsiveModal>
    </>
  );
}
```

- [ ] **Step 2.2: Run full UI test suite**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS)" | head -30
```

Expected: all tests pass (no regressions in domain tests that use FormModal).

- [ ] **Step 2.3: Commit**

```bash
git add app/ui/FormModal.tsx
git commit -m "refactor(ui): FormModal delegates to ResponsiveModal"
```

---

## Task 3: Create DesktopSidebar

**Files:**
- Create: `app/ui/DesktopSidebar.tsx`
- Create: `app/ui/DesktopSidebar.test.tsx`

- [ ] **Step 3.1: Write failing tests**

Create `app/ui/DesktopSidebar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "~/contexts/ThemeContext";

import type { AppShellHousehold } from "./DesktopSidebar";
import { DesktopSidebar } from "./DesktopSidebar";

const DEFAULT_NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" as const },
  { to: "/households", label: "Rateios", icon: "heart" as const },
  { to: "/accounts", label: "Contas", icon: "bank" as const },
  { to: "/cards", label: "Cartões", icon: "credit-card" as const },
  { to: "/settings", label: "Configurações", icon: "settings" as const },
];

function makeHousehold(overrides?: Partial<AppShellHousehold>): AppShellHousehold {
  return {
    householdId: "household-1",
    name: "Casa da Maria",
    role: "admin",
    ...overrides,
  };
}

function makeHouseholdNavItems(householdId: string, role: "admin" | "member") {
  const all = [
    { to: `/households/${householdId}`, label: "Visão geral", icon: "dashboard" as const },
    { to: `/households/${householdId}/transactions`, label: "Transações", icon: "wallet" as const },
    { to: `/households/${householdId}/categories`, label: "Categorias", icon: "categories" as const },
    { to: `/households/${householdId}/invite`, label: "Convites", icon: "invite" as const },
    { to: `/households/${householdId}/manage`, label: "Membros e gestão", icon: "admin-users" as const },
  ];
  return role === "admin" ? all : all.slice(0, 3);
}

function renderSidebar(props: Partial<Parameters<typeof DesktopSidebar>[0]> = {}) {
  const household = makeHousehold();
  const defaultProps = {
    isSidebarCollapsed: false,
    navItems: DEFAULT_NAV_ITEMS,
    householdNavItems: makeHouseholdNavItems("household-1", "admin"),
    activeHousehold: household,
    households: [household],
    preferredHouseholdId: "household-1",
    defaultHouseholdId: "household-1",
    currentPath: "/",
    onActiveHouseholdChange: () => {},
    ...props,
  };

  const router = createMemoryRouter(
    [
      {
        path: "/api/households/options",
        loader: () => ({
          options: [],
          recommendedHouseholdId: "household-1",
        }),
        element: <div>options</div>,
      },
      {
        path: "*",
        element: (
          <ThemeProvider>
            <DesktopSidebar {...defaultProps} />
          </ThemeProvider>
        ),
      },
    ],
    { initialEntries: ["/"] },
  );

  return render(<RouterProvider router={router} />);
}

describe("DesktopSidebar", () => {
  it("renderiza os itens de navegação principais", () => {
    renderSidebar();
    expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Contas")).toBeInTheDocument();
    expect(screen.getByLabelText("Cartões")).toBeInTheDocument();
  });

  it("mostra atalho de gestão para admin da household ativa", () => {
    renderSidebar();
    expect(screen.getByLabelText("Membros e gestão")).toBeInTheDocument();
  });

  it("oculta atalho de gestão para membro sem permissão administrativa", () => {
    renderSidebar({
      householdNavItems: makeHouseholdNavItems("household-1", "member"),
    });
    expect(screen.queryByLabelText("Membros e gestão")).not.toBeInTheDocument();
  });

  it("oculta labels quando colapsado", async () => {
    renderSidebar({ isSidebarCollapsed: true });
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Contas")).not.toBeInTheDocument();
  });

  it("mostra labels quando expandido", () => {
    renderSidebar({ isSidebarCollapsed: false });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Contas")).toBeInTheDocument();
  });

  it("oculta links de household quando usuário não participa de nenhuma", () => {
    renderSidebar({
      activeHousehold: null,
      householdNavItems: [],
    });
    expect(screen.queryByLabelText("Transações")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Categorias")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Convites")).not.toBeInTheDocument();
  });

  it("renderiza botão de logout", () => {
    renderSidebar();
    expect(screen.getByTitle("Sair")).toBeInTheDocument();
  });

  it("mostra apenas o select da household ativa e ordena a recomendada primeiro", () => {
    renderSidebar({
      households: [
        { householdId: "household-1", name: "Casa da Maria", role: "admin" },
        { householdId: "household-2", name: "Apartamento", role: "member" },
      ],
      activeHousehold: { householdId: "household-2", name: "Apartamento", role: "member" },
      preferredHouseholdId: "household-2",
      householdNavItems: makeHouseholdNavItems("household-2", "member"),
    });

    expect(screen.getByLabelText("Selecionar household ativa")).toBeInTheDocument();
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Apartamento");
  });
});
```

- [ ] **Step 3.2: Run tests to verify failure**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS|Error|Cannot find)" | head -20
```

Expected: FAIL — `Cannot find module './DesktopSidebar'`

- [ ] **Step 3.3: Implement DesktopSidebar**

Create `app/ui/DesktopSidebar.tsx`:

```tsx
import { Form, Link } from "react-router";

import { HouseholdSwitcher } from "~/domain/households/ui/HouseholdSwitcher";

import Icon, { type IconName } from "./Icon";

export type AppShellHousehold = {
  householdId: string;
  name: string;
  role: "admin" | "member";
};

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
};

type DesktopSidebarProps = {
  isSidebarCollapsed: boolean;
  navItems: NavItem[];
  householdNavItems: NavItem[];
  activeHousehold: AppShellHousehold | null;
  households: AppShellHousehold[];
  preferredHouseholdId: string | null;
  defaultHouseholdId: string | null;
  currentPath: string;
  onActiveHouseholdChange: (id: string) => void;
};

export function DesktopSidebar(props: DesktopSidebarProps) {
  const { isSidebarCollapsed } = props;

  return (
    <aside className="hidden md:flex row-start-1 row-end-6 col-start-1 col-end-2 flex-col border-r border-base-300 bg-base-200">
      <div className="flex h-full flex-col p-2">
        <Link
          to="/"
          className={[
            "flex items-center gap-3 rounded-box p-2",
            isSidebarCollapsed ? "justify-center" : "justify-start",
            "hover:bg-base-300",
          ].join(" ")}
        >
          <div className="avatar">
            <div className="w-10 rounded">
              <img src="/site-icon.png" alt="Financeiro" />
            </div>
          </div>
          {isSidebarCollapsed ? null : (
            <div className="leading-tight">
              <div className="font-semibold">Financeiro</div>
              <div className="text-xs opacity-70">Controle Financeiro</div>
            </div>
          )}
        </Link>

        <nav className="mt-4 flex-1">
          <ul className="menu w-full p-0">
            {props.navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  title={item.label}
                  className={[
                    "flex items-center",
                    isSidebarCollapsed ? "justify-center" : "justify-start",
                    "gap-3",
                  ].join(" ")}
                  aria-label={item.label}
                >
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-box",
                      "bg-base-300",
                      "text-sm font-semibold",
                    ].join(" ")}
                    aria-hidden={true}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  {isSidebarCollapsed ? null : <span>{item.label}</span>}
                </Link>
              </li>
            ))}

            {!isSidebarCollapsed && props.activeHousehold ? (
              <li className="menu-title mt-4 px-3 text-xs uppercase opacity-60">
                <span>Rateio ativo</span>
              </li>
            ) : null}

            {!isSidebarCollapsed && props.activeHousehold ? (
              <li className="mb-1 px-3 pb-2 text-sm">
                <HouseholdSwitcher
                  households={props.households}
                  activeHouseholdId={props.activeHousehold.householdId}
                  recommendedHouseholdId={
                    props.preferredHouseholdId ?? props.defaultHouseholdId
                  }
                  currentPath={props.currentPath}
                  onActiveHouseholdChange={props.onActiveHouseholdChange}
                />
              </li>
            ) : null}

            {props.householdNavItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  title={item.label}
                  className={[
                    "flex items-center",
                    isSidebarCollapsed
                      ? "justify-center"
                      : "justify-start pl-6",
                    "gap-3",
                  ].join(" ")}
                  aria-label={item.label}
                >
                  <span
                    className={[
                      "inline-flex h-8 w-8 items-center justify-center rounded-box",
                      "bg-base-300",
                      "text-sm font-semibold",
                    ].join(" ")}
                    aria-hidden={true}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  {isSidebarCollapsed ? null : <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-2">
          <Form method="post" action="/logout">
            <button
              type="submit"
              className={[
                "btn btn-ghost w-full",
                isSidebarCollapsed ? "btn-square mx-auto" : "justify-start",
              ].join(" ")}
              title="Sair"
            >
              {isSidebarCollapsed ? (
                <Icon name="logout" className="h-4 w-4" />
              ) : (
                <>
                  <Icon name="logout" className="h-4 w-4" />
                  <span>Sair</span>
                </>
              )}
            </button>
          </Form>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3.4: Run tests to verify pass**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS|✓|✗)" | grep -E "DesktopSidebar"
```

Expected: all `DesktopSidebar.test.tsx` tests pass.

- [ ] **Step 3.5: Commit**

```bash
git add app/ui/DesktopSidebar.tsx app/ui/DesktopSidebar.test.tsx
git commit -m "feat(ui): add DesktopSidebar component extracted from AppShell"
```

---

## Task 4: Create MobileBottomNav

**Files:**
- Create: `app/ui/MobileBottomNav.tsx`
- Create: `app/ui/MobileBottomNav.test.tsx`

- [ ] **Step 4.1: Write failing tests**

Create `app/ui/MobileBottomNav.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileBottomNav } from "./MobileBottomNav";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" as const },
  { to: "/households", label: "Rateios", icon: "heart" as const },
  { to: "/accounts", label: "Contas", icon: "bank" as const },
  { to: "/cards", label: "Cartões", icon: "credit-card" as const },
  { to: "/settings", label: "Configurações", icon: "settings" as const },
];

describe("MobileBottomNav", () => {
  it("renderiza todos os itens de navegação", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Rateios")).toBeInTheDocument();
    expect(screen.getByLabelText("Contas")).toBeInTheDocument();
    expect(screen.getByLabelText("Cartões")).toBeInTheDocument();
    expect(screen.getByLabelText("Configurações")).toBeInTheDocument();
  });

  it("todos os links apontam para as rotas corretas", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByLabelText("Rateios").closest("a")).toHaveAttribute("href", "/households");
    expect(screen.getByLabelText("Contas").closest("a")).toHaveAttribute("href", "/accounts");
    expect(screen.getByLabelText("Cartões").closest("a")).toHaveAttribute("href", "/cards");
    expect(screen.getByLabelText("Configurações").closest("a")).toHaveAttribute("href", "/settings");
  });

  it("marca Dashboard como ativo na rota raiz /", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não marca Dashboard como ativo em sub-rotas", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Contas como ativo em /accounts", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts" />);
    expect(screen.getByLabelText("Contas").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Contas como ativo em sub-rota /accounts/123", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts/123" />);
    expect(screen.getByLabelText("Contas").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não marca itens inativos com aria-current", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByLabelText("Rateios").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renderiza nav com role navigation", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByRole("navigation", { name: "Navegação mobile" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4.2: Run tests to verify failure**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS|Error|Cannot find)" | head -20
```

Expected: FAIL — `Cannot find module './MobileBottomNav'`

- [ ] **Step 4.3: Implement MobileBottomNav**

Create `app/ui/MobileBottomNav.tsx`:

```tsx
import { Link } from "react-router";

import Icon, { type IconName } from "./Icon";

type NavItem = {
  to: string;
  label: string;
  icon: IconName;
};

type MobileBottomNavProps = {
  navItems: NavItem[];
  currentPath: string;
};

function isNavItemActive(itemTo: string, currentPath: string): boolean {
  if (itemTo === "/") return currentPath === "/";
  return currentPath === itemTo || currentPath.startsWith(`${itemTo}/`);
}

export function MobileBottomNav({ navItems, currentPath }: MobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 md:hidden z-40 bg-base-200 border-t border-base-300"
      aria-label="Navegação mobile"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const active = isNavItemActive(item.to, currentPath);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs",
                active ? "text-primary" : "opacity-60",
              ].join(" ")}
            >
              <Icon name={item.icon} className="h-6 w-6" />
              <span aria-hidden>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4.4: Run tests to verify pass**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS|✓|✗)" | grep "MobileBottomNav"
```

Expected: all `MobileBottomNav.test.tsx` tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add app/ui/MobileBottomNav.tsx app/ui/MobileBottomNav.test.tsx
git commit -m "feat(ui): add MobileBottomNav fixed bottom bar for mobile"
```

---

## Task 5: Update AppShell

**Files:**
- Modify: `app/ui/AppShell.tsx`
- Modify: `app/ui/AppShell.test.tsx`

- [ ] **Step 5.1: Rewrite AppShell.test.tsx (simplified)**

Replace entire content of `app/ui/AppShell.test.tsx` with:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "~/contexts/ThemeContext";

import { AppShell } from "./AppShell";

function renderShell(ui: ReactNode) {
  const router = createMemoryRouter(
    [
      {
        path: "/api/households/options",
        loader: () => ({
          options: [],
          recommendedHouseholdId: "household-1",
        }),
        element: <div>options</div>,
      },
      {
        path: "*",
        element: <ThemeProvider>{ui}</ThemeProvider>,
      },
    ],
    { initialEntries: ["/"] },
  );

  return render(<RouterProvider router={router} />);
}

function makeUser(overrides?: Partial<Parameters<typeof AppShell>[0]["user"]>) {
  return {
    username: "maria",
    isAdmin: false,
    households: [
      { householdId: "household-1", name: "Casa da Maria", role: "admin" as const },
    ],
    defaultHouseholdId: "household-1",
    preferredHouseholdId: "household-1",
    ...overrides,
  };
}

describe("AppShell", () => {
  it("renderiza children no main", () => {
    renderShell(
      <AppShell user={makeUser()}>
        <div>Conteúdo principal</div>
      </AppShell>,
    );
    expect(screen.getByText("Conteúdo principal")).toBeInTheDocument();
  });

  it("exibe o username do usuário no header", () => {
    renderShell(
      <AppShell user={makeUser()}>
        <div />
      </AppShell>,
    );
    expect(screen.getByText("maria")).toBeInTheDocument();
  });

  it("mostra badge de offline ao disparar evento", async () => {
    renderShell(
      <AppShell user={makeUser()}>
        <div />
      </AppShell>,
    );

    expect(screen.queryByText(/Offline — somente leitura/)).not.toBeInTheDocument();

    window.dispatchEvent(new Event("offline"));

    await waitFor(() => {
      expect(screen.getByText(/Offline — somente leitura/)).toBeInTheDocument();
    });

    window.dispatchEvent(new Event("online"));

    await waitFor(() => {
      expect(screen.queryByText(/Offline — somente leitura/)).not.toBeInTheDocument();
    });
  });

  it("renderiza MobileBottomNav com link para Dashboard", () => {
    renderShell(
      <AppShell user={makeUser()}>
        <div />
      </AppShell>,
    );
    expect(screen.getByRole("navigation", { name: "Navegação mobile" })).toBeInTheDocument();
  });

  it("toggle do menu alterna aria-label entre recolher/expandir", async () => {
    const user = userEvent.setup();
    renderShell(
      <AppShell user={makeUser()}>
        <div />
      </AppShell>,
    );

    const collapseButton = screen.getByRole("button", { name: "Recolher menu" });
    expect(collapseButton).toBeInTheDocument();

    await user.click(collapseButton);

    expect(screen.getByRole("button", { name: "Expandir menu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Recolher menu" })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 5.2: Run tests to verify baseline**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS)" | head -20
```

Expected: `AppShell.test.tsx` tests FAIL (component not yet updated), others PASS.

- [ ] **Step 5.3: Rewrite AppShell.tsx**

Replace entire content of `app/ui/AppShell.tsx` with:

```tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

import { useTheme } from "~/contexts/ThemeContext";

import { DesktopSidebar, type AppShellHousehold } from "./DesktopSidebar";
import Icon, { type IconName } from "./Icon";
import { MobileBottomNav } from "./MobileBottomNav";

type AppShellUser = {
  username: string;
  isAdmin: boolean;
  households: AppShellHousehold[];
  defaultHouseholdId: string | null;
  preferredHouseholdId: string | null;
};

export function AppShell(props: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [preferredHouseholdId, setPreferredHouseholdId] = useState(
    props.user.preferredHouseholdId ?? props.user.defaultHouseholdId,
  );
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
    }
    function onOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    setPreferredHouseholdId(
      props.user.preferredHouseholdId ?? props.user.defaultHouseholdId,
    );
  }, [props.user.defaultHouseholdId, props.user.preferredHouseholdId]);

  const shellGridCols = isSidebarCollapsed
    ? "grid-cols-1 md:grid-cols-[4rem_repeat(4,minmax(0,1fr))]"
    : "grid-cols-1 md:grid-cols-[16rem_repeat(4,minmax(0,1fr))]";

  const activeHouseholdId = useMemo(() => {
    const match = location.pathname.match(/^\/households\/([^/]+)/);
    return match?.[1] ?? preferredHouseholdId ?? props.user.defaultHouseholdId;
  }, [location.pathname, preferredHouseholdId, props.user.defaultHouseholdId]);

  const activeHousehold = useMemo(
    () =>
      props.user.households.find(
        (household) => household.householdId === activeHouseholdId,
      ) ?? null,
    [activeHouseholdId, props.user.households],
  );

  const navItems = useMemo(() => {
    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      { to: "/", label: "Dashboard", icon: "dashboard", visible: true },
      { to: "/households", label: "Rateios", icon: "heart", visible: true },
      { to: "/accounts", label: "Contas", icon: "bank", visible: true },
      { to: "/cards", label: "Cartões", icon: "credit-card", visible: true },
      { to: "/settings", label: "Configurações", icon: "settings", visible: true },
    ];
    return items.filter((i) => i.visible);
  }, []);

  const householdNavItems = useMemo(() => {
    if (!activeHousehold) return [];
    const items: Array<{
      to: string;
      label: string;
      icon: IconName;
      visible: boolean;
    }> = [
      {
        to: `/households/${activeHousehold.householdId}`,
        label: "Visão geral",
        icon: "dashboard",
        visible: true,
      },
      {
        to: `/households/${activeHousehold.householdId}/transactions`,
        label: "Transações",
        icon: "wallet",
        visible: true,
      },
      {
        to: `/households/${activeHousehold.householdId}/categories`,
        label: "Categorias",
        icon: "categories",
        visible: true,
      },
      {
        to: `/households/${activeHousehold.householdId}/invite`,
        label: "Convites",
        icon: "invite",
        visible: activeHousehold.role === "admin",
      },
      {
        to: `/households/${activeHousehold.householdId}/manage`,
        label: "Membros e gestão",
        icon: "admin-users",
        visible: activeHousehold.role === "admin",
      },
    ];
    return items.filter((item) => item.visible);
  }, [activeHousehold]);

  return (
    <div
      className={[
        "min-h-dvh",
        "grid",
        "grid-rows-[3.5rem_repeat(4,minmax(0,1fr))]",
        shellGridCols,
      ].join(" ")}
    >
      <DesktopSidebar
        isSidebarCollapsed={isSidebarCollapsed}
        navItems={navItems}
        householdNavItems={householdNavItems}
        activeHousehold={activeHousehold}
        households={props.user.households}
        preferredHouseholdId={preferredHouseholdId}
        defaultHouseholdId={props.user.defaultHouseholdId}
        currentPath={`${location.pathname}${location.search}`}
        onActiveHouseholdChange={setPreferredHouseholdId}
      />

      <header className="row-start-1 row-end-2 col-start-1 col-end-2 md:col-start-2 md:col-end-6 border-b border-base-300 bg-base-100">
        <div className="flex h-full items-center justify-between px-4">
          <button
            type="button"
            className="hidden md:inline-flex btn btn-ghost btn-square"
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            aria-label={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isSidebarCollapsed ? "»" : "«"}
          </button>

          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              className="btn btn-ghost btn-square"
              onClick={toggleTheme}
              aria-label={
                theme === "sunset" ? "Ativar tema claro" : "Ativar tema escuro"
              }
              title={
                theme === "sunset" ? "Ativar tema claro" : "Ativar tema escuro"
              }
            >
              <Icon
                name={theme === "sunset" ? ("sun" as IconName) : ("moon" as IconName)}
                className="h-4 w-4"
              />
            </button>
            {isOnline ? null : (
              <span className="badge badge-warning" title="Offline (somente leitura)">
                Offline — somente leitura
              </span>
            )}
            <span className="opacity-70">Usuário: </span>
            <span className="font-medium">{props.user.username}</span>
          </div>
        </div>
      </header>

      <main className="row-start-2 row-end-6 col-start-1 col-end-2 md:col-start-2 md:col-end-6 min-h-0 overflow-y-auto pb-20 md:pb-0">
        {props.children}
      </main>

      <MobileBottomNav navItems={navItems} currentPath={location.pathname} />
    </div>
  );
}
```

- [ ] **Step 5.4: Run full UI test suite**

```bash
npm run test:ui -- --reporter=verbose 2>&1 | grep -E "(FAIL|PASS)"
```

Expected: ALL tests pass across all test files.

- [ ] **Step 5.5: Commit**

```bash
git add app/ui/AppShell.tsx app/ui/AppShell.test.tsx
git commit -m "refactor(ui): AppShell uses DesktopSidebar and MobileBottomNav; responsive grid layout"
```

---

## Final Verification

- [ ] **Run complete test suite**

```bash
npm run test:ui
```

Expected output: all tests pass, no failures.

- [ ] **Typecheck**

```bash
npm run typecheck 2>&1 | tail -5
```

Expected: no TypeScript errors.
