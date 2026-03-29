import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReceiptItemsTable } from "./ReceiptItemsTable";
import type { ReceiptItem } from "~/domain/receipt/entity";

function makeItem(overrides: Partial<ReceiptItem> = {}): ReceiptItem {
  return {
    id: overrides.id ?? "item-1",
    name: overrides.name ?? "Arroz",
    quantity: overrides.quantity ?? 1,
    unitPriceCents: overrides.unitPriceCents ?? 2290,
    totalPriceCents: overrides.totalPriceCents ?? 2290,
  };
}

describe("ReceiptItemsTable", () => {
  it("renderiza uma linha por item", () => {
    const items = [
      makeItem({ id: "i1", name: "Arroz" }),
      makeItem({ id: "i2", name: "Feijão" }),
    ];

    render(
      <ReceiptItemsTable
        items={items}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Arroz")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Feijão")).toBeInTheDocument();
  });

  it("chama onUpdate ao editar o nome do item", () => {
    const onUpdate = vi.fn();
    const items = [makeItem({ id: "i1", name: "Arroz" })];

    render(
      <ReceiptItemsTable
        items={items}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Arroz"), {
      target: { value: "Arroz Tio João" },
    });

    expect(onUpdate).toHaveBeenCalledWith("i1", "name", "Arroz Tio João");
  });

  it("chama onUpdate ao editar a quantidade", () => {
    const onUpdate = vi.fn();
    const items = [makeItem({ id: "i1", quantity: 1 })];

    render(
      <ReceiptItemsTable
        items={items}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    const qtyInputs = screen.getAllByRole("spinbutton");
    fireEvent.change(qtyInputs[0], { target: { value: "3" } });

    expect(onUpdate).toHaveBeenCalledWith("i1", "quantity", "3");
  });

  it("chama onRemove ao clicar no botão de remover", () => {
    const onRemove = vi.fn();
    const items = [makeItem({ id: "i1", name: "Arroz" })];

    render(
      <ReceiptItemsTable
        items={items}
        onUpdate={vi.fn()}
        onRemove={onRemove}
        onAdd={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remover/i }));

    expect(onRemove).toHaveBeenCalledWith("i1");
  });

  it("chama onAdd ao clicar no botão de adicionar item", () => {
    const onAdd = vi.fn();

    render(
      <ReceiptItemsTable
        items={[]}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /adicionar item/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("mostra o total geral no rodapé da tabela", () => {
    const items = [
      makeItem({ id: "i1", totalPriceCents: 2290 }),
      makeItem({ id: "i2", totalPriceCents: 1700 }),
    ];

    render(
      <ReceiptItemsTable
        items={items}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    // R$ 39,90
    expect(screen.getByText(/39,90/)).toBeInTheDocument();
  });

  it("renderiza tabela vazia sem erros", () => {
    render(
      <ReceiptItemsTable
        items={[]}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /adicionar item/i })).toBeInTheDocument();
  });
});
