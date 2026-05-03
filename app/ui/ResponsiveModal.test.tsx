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
    await user.click(screen.getByRole("button", { name: "Cancelar", hidden: true }));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  it("usa texto personalizado quando fornecido", () => {
    render(
      <dialog>
        <ModalCloseButton>Fechar</ModalCloseButton>
      </dialog>,
    );
    expect(screen.getByRole("button", { name: "Fechar", hidden: true })).toBeInTheDocument();
  });

  it("aplica classe personalizada quando fornecida", () => {
    render(
      <dialog>
        <ModalCloseButton className="btn btn-error" />
      </dialog>,
    );
    expect(screen.getByRole("button", { hidden: true })).toHaveClass("btn-error");
  });
});
