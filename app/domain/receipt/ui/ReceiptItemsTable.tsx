import type { ReceiptItem } from "~/domain/receipt/entity";
import { formatBRL } from "~/lib/money";

type Props = {
  items: ReceiptItem[];
  onUpdate: (id: string, field: "name" | "quantity" | "unitPriceCents", value: string | number) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
};

export function ReceiptItemsTable({ items, onUpdate, onRemove, onAdd }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Descrição</th>
              <th className="w-20">Qtd</th>
              <th className="w-32">Preço unit.</th>
              <th className="w-28 text-right">Total</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="text"
                    className="input input-sm w-full"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input input-sm w-20"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input input-sm w-32"
                    min={0}
                    step={0.01}
                    value={(item.unitPriceCents / 100).toFixed(2)}
                    onChange={(e) => onUpdate(item.id, "unitPriceCents", e.target.value)}
                  />
                </td>
                <td className="text-right font-mono text-sm">
                  {formatBRL(item.totalPriceCents)}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => onRemove(item.id)}
                    aria-label="Remover item"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right font-semibold">Total</td>
              <td className="text-right font-mono font-semibold">
                {formatBRL(items.reduce((s, i) => s + i.totalPriceCents, 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <button type="button" className="btn btn-ghost btn-sm self-start" onClick={onAdd}>
        + Adicionar item
      </button>
    </div>
  );
}
