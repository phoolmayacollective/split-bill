"use client";

import { useMemo } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney, itemLineTotal } from "@/lib/bill-totals";
import { cn } from "@/lib/utils";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { calculateOwerTotal, type SplitClaim } from "@/lib/split";

type OwerItemPickerProps = {
  items: BillItem[];
  totals: BillTotals;
  owerName: string;
  existingClaims: SplitClaim[];
  selectedIds: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
};

function buildPreviewClaims(
  existingClaims: SplitClaim[],
  owerName: string,
  selectedIds: Set<string>,
): SplitClaim[] {
  const otherClaims = existingClaims.filter(
    (claim) => claim.ower_name !== owerName,
  );

  const draftClaims = [...selectedIds].map((item_id) => ({
    ower_name: owerName,
    item_id,
    share: 1,
  }));

  return [...otherClaims, ...draftClaims];
}

export function OwerItemPicker({
  items,
  totals,
  owerName,
  existingClaims,
  selectedIds,
  onSelectionChange,
}: OwerItemPickerProps) {
  const preview = useMemo(() => {
    const claims = buildPreviewClaims(existingClaims, owerName, selectedIds);

    return calculateOwerTotal({
      items,
      totals,
      claims,
      ower_name: owerName,
    });
  }, [existingClaims, items, owerName, selectedIds, totals]);

  function toggleItem(itemId: string, checked: boolean) {
    const next = new Set(selectedIds);

    if (checked) {
      next.add(itemId);
    } else {
      next.delete(itemId);
    }

    onSelectionChange(next);
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const checked = selectedIds.has(item.id);
        const lineTotal = itemLineTotal(item);

        return (
          <label
            key={item.id}
            htmlFor={`claim-${item.id}`}
            className={cn(
              "bg-card flex cursor-pointer items-start gap-3 rounded-xl border p-4",
              checked && "border-primary bg-primary/5",
            )}
          >
            <Checkbox
              id={`claim-${item.id}`}
              checked={checked}
              onCheckedChange={(nextChecked) => toggleItem(item.id, nextChecked)}
              className="mt-0.5"
            />

            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium leading-snug">{item.name}</p>
              <p className="text-muted-foreground text-sm">
                {item.qty > 1 ? `${item.qty} × ${formatMoney(item.price)}` : null}
                {item.qty > 1 ? " · " : null}
                <span className="tabular-nums">{formatMoney(lineTotal)}</span>
              </p>
            </div>
          </label>
        );
      })}

      {preview && selectedIds.size > 0 ? (
        <div className="text-muted-foreground flex justify-between text-sm">
          <span>Your share (before tax & tip)</span>
          <span className="text-foreground font-medium tabular-nums">
            {formatMoney(preview.subtotal)}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function useOwerPreviewTotal(
  items: BillItem[],
  totals: BillTotals,
  owerName: string,
  existingClaims: SplitClaim[],
  selectedIds: Set<string>,
): number {
  return useMemo(() => {
    const claims = buildPreviewClaims(existingClaims, owerName, selectedIds);
    const result = calculateOwerTotal({
      items,
      totals,
      claims,
      ower_name: owerName,
    });

    return result?.total ?? 0;
  }, [existingClaims, items, owerName, selectedIds, totals]);
}
