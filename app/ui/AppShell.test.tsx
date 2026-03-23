import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "~/contexts/ThemeContext";

import { AppShell } from "./AppShell";

function renderShell(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <ThemeProvider>{ui}</ThemeProvider>
    </MemoryRouter>
  );
}

function makeUser(overrides?: Partial<Parameters<typeof AppShell>[0]["user"]>) {
  return {
    username: "maria",
    isAdmin: false,
    households: [
      {
        householdId: "household-1",
        name: "Casa da Maria",
        role: "admin" as const,
      },
    ],
    defaultHouseholdId: "household-1",
    ...overrides,
  };
}

describe("AppShell", () => {
  it("mostra atalho de gestão para admin da household ativa", () => {
    renderShell(
      <AppShell user={makeUser()}>
        <div>Conteúdo</div>
      </AppShell>
    );

    expect(screen.getByLabelText("Membros e gestão")).toBeInTheDocument();
  });

  it("oculta atalho de gestão para membro sem permissão administrativa na household", () => {
    renderShell(
      <AppShell
        user={makeUser({
          households: [
            {
              householdId: "household-1",
              name: "Casa da Maria",
              role: "member",
            },
          ],
        })}
      >
        <div>Conteúdo</div>
      </AppShell>
    );

    expect(screen.queryByLabelText("Membros e gestão")).not.toBeInTheDocument();
  });

  it("toggle do menu alterna entre recolher/expandir", async () => {
    const user = userEvent.setup();

    const view = renderShell(
      <AppShell user={makeUser()}>
        <div>Conteúdo</div>
      </AppShell>
    );

    const collapseButton = view.getAllByRole("button", { name: "Recolher menu" })[0]!;
    expect(collapseButton).toBeInTheDocument();
    expect(view.getByText("Dashboard")).toBeInTheDocument();

    await user.click(collapseButton);

    expect(view.getAllByRole("button", { name: "Expandir menu" })[0]!).toBeInTheDocument();
    expect(view.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("mostra badge de offline ao disparar evento", async () => {
    renderShell(
      <AppShell user={makeUser()}>
        <div>Conteúdo</div>
      </AppShell>
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

  it("oculta links dependentes de household quando o usuário ainda não participa de nenhuma", () => {
    renderShell(
      <AppShell
        user={makeUser({
          username: "nova",
          households: [],
          defaultHouseholdId: null,
        })}
      >
        <div>Conteúdo</div>
      </AppShell>
    );

    expect(screen.getByLabelText("Households")).toBeInTheDocument();
    expect(screen.queryByLabelText("Convites")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Transações")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Categorias")).not.toBeInTheDocument();
  });
});
