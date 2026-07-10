"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BillItem } from "@/lib/database.types";
import { formatMoney, itemLineTotal } from "@/lib/bill-totals";

type BillItemEditorProps = {
  item: BillItem;
  index: number;
  onChange: (item: BillItem) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export function BillItemEditor({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
}: BillItemEditorProps) {
  return (
    <div className="bg-card space-y-3 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">
          Item {index + 1}
        </p>
        <p className="text-sm font-medium tabular-nums">
          {formatMoney(itemLineTotal(item))}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`item-name-${item.id}`}>Name</Label>
        <Input
          id={`item-name-${item.id}`}
          placeholder="e.g. Margherita pizza"
          value={item.name}
          onChange={(event) =>
            onChange({ ...item, name: event.target.value })
          }
          className="h-10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`item-price-${item.id}`}>Price</Label>
          <Input
            id={`item-price-${item.id}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={Number.isNaN(item.price) ? "" : item.price}
            onChange={(event) =>
              onChange({
                ...item,
                price: event.target.value === "" ? 0 : Number(event.target.value),
              })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`item-qty-${item.id}`}>Qty</Label>
          <Input
            id={`item-qty-${item.id}`}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={Number.isNaN(item.qty) ? "" : item.qty}
            onChange={(event) =>
              onChange({
                ...item,
                qty:
                  event.target.value === ""
                    ? 1
                    : Math.max(1, Number(event.target.value)),
              })
            }
            className="h-10"
          />
        </div>
      </div>

      {canRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-muted-foreground w-full"
        >
          <Trash2 />
          Remove item
        </Button>
      ) : null}
    </div>
  );
}
