import { render, screen } from "@testing-library/react";
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

  it("aplica classe ativa no item de nav correspondente ao caminho atual", () => {
    renderSidebar({ currentPath: "/accounts" });
    const contasLink = screen.getByRole("link", { name: "Contas" });
    expect(contasLink.closest("li")).toHaveClass("active");
  });

  it("aplica active no Dashboard apenas quando path é exato /", () => {
    renderSidebar({ currentPath: "/accounts" });
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink.closest("li")).not.toHaveClass("active");
  });
});
