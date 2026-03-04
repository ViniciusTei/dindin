import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("não mostra item de admin para usuário não-admin", () => {
    render(
      <AppShell user={{ username: "maria", isAdmin: false }}>
        <div>Conteúdo</div>
      </AppShell>
    );

    expect(screen.queryByLabelText("Admin: usuários")).not.toBeInTheDocument();
  });

  it("mostra item de admin para admin", () => {
    render(
      <AppShell user={{ username: "admin", isAdmin: true }}>
        <div>Conteúdo</div>
      </AppShell>
    );

    expect(screen.getByLabelText("Admin: usuários")).toBeInTheDocument();
  });

  it("toggle do menu alterna entre recolher/expandir", async () => {
    const user = userEvent.setup();

    const view = render(
      <AppShell user={{ username: "maria", isAdmin: false }}>
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
    render(
      <AppShell user={{ username: "maria", isAdmin: false }}>
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
});
