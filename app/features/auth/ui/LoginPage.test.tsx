import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("renderiza título e campos", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("mostra erro e marca o input de senha como inválido", () => {
    render(<LoginPage error="Credenciais inválidas" />);

    const password = screen.getByLabelText("Senha");
    expect(password).toHaveAttribute("aria-invalid");
    expect(password).toHaveAttribute("aria-describedby", "login-error");

    expect(screen.getByRole("alert")).toHaveTextContent("Credenciais inválidas");
  });
});
