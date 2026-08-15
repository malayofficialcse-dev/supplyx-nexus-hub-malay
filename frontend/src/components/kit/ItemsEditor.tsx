import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { formatCurrency } from "@/lib/format";

export interface LineItem {
  item: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export function emptyItem(): LineItem {
  return { item: "", quantity: 1, unitPrice: 0, unit: "EA" };
}

export function itemsTotal(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);
}

export function ItemsEditor({
  value,
  onChange,
}: {
  value: LineItem[];
  onChange: (items: LineItem[]) => void;
}) {
  const items = value.length ? value : [emptyItem()];

  const update = (index: number, patch: Partial<LineItem>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  return (
    <div className="rounded-sm border border-border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/70 text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-1.5 text-left font-semibold">Item</th>
            <th className="w-20 px-2 py-1.5 text-left font-semibold">Unit</th>
            <th className="w-24 px-2 py-1.5 text-right font-semibold">Qty</th>
            <th className="w-28 px-2 py-1.5 text-right font-semibold">Unit price</th>
            <th className="w-28 px-2 py-1.5 text-right font-semibold">Line total</th>
            <th className="w-9" />
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="px-2 py-1.5">
                <Input
                  value={it.item}
                  placeholder="Description"
                  onChange={(e) => update(i, { item: e.target.value })}
                />
              </td>
              <td className="px-2 py-1.5">
                <Input value={it.unit ?? ""} onChange={(e) => update(i, { unit: e.target.value })} />
              </td>
              <td className="px-2 py-1.5">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  className="text-right"
                  value={it.quantity}
                  onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                />
              </td>
              <td className="px-2 py-1.5">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  className="text-right"
                  value={it.unitPrice}
                  onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
                />
              </td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatCurrency(Number(it.quantity || 0) * Number(it.unitPrice || 0))}
              </td>
              <td className="px-1 py-1.5 text-right">
                <Button
                  variant="subtle"
                  size="icon"
                  aria-label="Remove line"
                  disabled={items.length === 1}
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-2 py-1.5">
        <Button variant="subtle" size="sm" onClick={() => onChange([...items, emptyItem()])}>
          <Plus className="h-3.5 w-3.5" />
          Add line
        </Button>
        <span className="text-[12px] font-semibold">
          Total: <span className="tabular-nums">{formatCurrency(itemsTotal(items))}</span>
        </span>
      </div>
    </div>
  );
}
