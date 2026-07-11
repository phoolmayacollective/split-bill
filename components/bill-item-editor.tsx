"use client";

import { Trash2 } from "lucide-react";

import { SectionCard } from "@/components/layout/section-card";
import { ErrorMessage } from "@/components/feedback/error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyAmount } from "@/components/bill/money-amount";
import type { BillItem } from "@/lib/database.types";
import { itemLineTotal } from "@/lib/bill-totals";
import { cn } from "@/lib/utils";

type BillItemEditorProps = {
  item: BillItem;
  index: number;
  onChange: (item: BillItem) => void;
  onRemove: () => void;
  canRemove: boolean;
  invalid?: boolean;
  errorMessage?: string | null;
};

export function BillItemEditor({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  invalid = false,
  errorMessage,
}: BillItemEditorProps) {
  return (
    <SectionCard
      className={cn(invalid && "border-destructive/40 bg-destructive/5")}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-sm font-medium">
          Item {index + 1}
        </p>
        <MoneyAmount amount={itemLineTotal(item)} size="sm" />
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
          aria-invalid={invalid && !item.name.trim()}
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
            aria-invalid={invalid && item.price <= 0}
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
          />
        </div>
      </div>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}

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
    </SectionCard>
  );
}
