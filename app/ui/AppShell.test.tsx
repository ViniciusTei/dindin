import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { SidebarProvider } from "~/contexts/SidebarContext";
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
        element: <ThemeProvider><SidebarProvider>{ui}</SidebarProvider></ThemeProvider>,
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
