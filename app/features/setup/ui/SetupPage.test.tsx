import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SetupPage } from "./SetupPage";

describe("SetupPage", () => {
  it("renderiza título e campos", () => {
    render(<SetupPage />);

    expect(screen.getByRole("heading", { name: "Setup inicial" })).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar admin" })).toBeInTheDocument();
  });

  it("mostra erro e marca o input de senha como inválido", () => {
    render(<SetupPage error="Falha" />);

    const password = screen.getByLabelText("Senha");
    expect(password).toHaveAttribute("aria-invalid");
    expect(password).toHaveAttribute("aria-describedby", "setup-error");

    expect(screen.getByRole("alert")).toHaveTextContent("Falha");
  });
});
