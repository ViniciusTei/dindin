import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    {
      initialEntries: ["/"],
    },
  );

  return render(
    <RouterProvider router={router} />
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
    preferredHouseholdId: "household-1",
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
          preferredHouseholdId: null,
        })}
      >
        <div>Conteúdo</div>
      </AppShell>
    );

    expect(screen.getByLabelText("Rateios")).toBeInTheDocument();
    expect(screen.queryByLabelText("Convites")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Transações")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Categorias")).not.toBeInTheDocument();
  });

  it("mostra apenas o select da household ativa e ordena a recomendada primeiro", () => {
    renderShell(
      <AppShell
        user={makeUser({
          households: [
            {
              householdId: "household-1",
              name: "Casa da Maria",
              role: "admin",
            },
            {
              householdId: "household-2",
              name: "Apartamento",
              role: "member",
            },
          ],
          preferredHouseholdId: "household-2",
        })}
      >
        <div>Conteúdo</div>
      </AppShell>,
    );

    expect(
      screen.getByLabelText("Selecionar household ativa"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Buscar household")).not.toBeInTheDocument();
    expect(screen.queryByText(/Recomendada:/)).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("option")[0],
    ).toHaveTextContent("Apartamento");
  });
});
