import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { SidebarProvider } from "~/contexts/SidebarContext";
import { ThemeProvider } from "~/contexts/ThemeContext";

import { HouseholdManageSidebar } from "./HouseholdManageSidebar";

function renderSidebar(props: Partial<Parameters<typeof HouseholdManageSidebar>[0]> = {}) {
  const defaultProps = {
    householdId: "household-1",
    householdName: "Casa da Maria",
    role: "admin" as const,
    ...props,
  };

  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <ThemeProvider>
            <SidebarProvider>
              <HouseholdManageSidebar {...defaultProps} />
            </SidebarProvider>
          </ThemeProvider>
        ),
      },
    ],
    { initialEntries: ["/households/household-1/manage"] },
  );

  return render(<RouterProvider router={router} />);
}

describe("HouseholdManageSidebar", () => {
  it("renderiza o nome da household", () => {
    renderSidebar();
    expect(screen.getByText("Casa da Maria")).toBeInTheDocument();
  });

  it("renderiza todos os links de navegação para admin", () => {
    renderSidebar();
    expect(screen.getByLabelText("Visão geral")).toBeInTheDocument();
    expect(screen.getByLabelText("Transações")).toBeInTheDocument();
    expect(screen.getByLabelText("Categorias")).toBeInTheDocument();
    expect(screen.getByLabelText("Convites")).toBeInTheDocument();
    expect(screen.getByLabelText("Membros e gestão")).toBeInTheDocument();
  });

  it("oculta links admin-only para member", () => {
    renderSidebar({ role: "member" });
    expect(screen.getByLabelText("Visão geral")).toBeInTheDocument();
    expect(screen.getByLabelText("Transações")).toBeInTheDocument();
    expect(screen.getByLabelText("Categorias")).toBeInTheDocument();
    expect(screen.queryByLabelText("Convites")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Membros e gestão")).not.toBeInTheDocument();
  });

  it("destaca Membros e gestão como ativo quando na rota /manage", () => {
    renderSidebar();
    const link = screen.getByLabelText("Membros e gestão");
    expect(link.closest("li")).toHaveClass("active");
  });

  it("destaca Visão geral como ativo quando na rota raiz da household", () => {
    const router = createMemoryRouter(
      [
        {
          path: "*",
          element: (
            <ThemeProvider>
              <SidebarProvider>
                <HouseholdManageSidebar
                  householdId="household-1"
                  householdName="Casa da Maria"
                  role="admin"
                />
              </SidebarProvider>
            </ThemeProvider>
          ),
        },
      ],
      { initialEntries: ["/households/household-1"] },
    );

    render(<RouterProvider router={router} />);
    const link = screen.getByLabelText("Visão geral");
    expect(link.closest("li")).toHaveClass("active");
  });

  it("não renderiza sidebar no mobile (classe hidden md:flex)", () => {
    renderSidebar();
    const aside = document.querySelector("aside");
    expect(aside).toHaveClass("hidden");
    expect(aside).toHaveClass("md:flex");
  });
});
