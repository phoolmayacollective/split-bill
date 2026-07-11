"use client";

import { useMemo } from "react";

import { MoneyAmount } from "@/components/bill/money-amount";
import { Checkbox } from "@/components/ui/checkbox";
import { formatMoney, itemLineTotal } from "@/lib/bill-totals";
import {
  type ClaimQuantities,
  getMaxClaimableUnits,
  getOthersClaimedUnits,
} from "@/lib/claim-units";
import {
  formatSplitBetweenPeople,
  formatUnitClaimLabel,
  getItemClaimantCount,
} from "@/lib/item-split-display";
import { cn } from "@/lib/utils";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { calculateOwerTotal, type SplitClaim } from "@/lib/split";

type OwerItemPickerProps = {
  items: BillItem[];
  totals: BillTotals;
  owerName: string;
  existingClaims: SplitClaim[];
  claimQuantities: ClaimQuantities;
  onClaimQuantitiesChange: (quantities: ClaimQuantities) => void;
};

function buildPreviewClaims(
  existingClaims: SplitClaim[],
  owerName: string,
  claimQuantities: ClaimQuantities,
): SplitClaim[] {
  const otherClaims = existingClaims.filter(
    (claim) => claim.ower_name !== owerName,
  );

  const draftClaims = Object.entries(claimQuantities)
    .filter(([, share]) => share > 0)
    .map(([item_id, share]) => ({
      ower_name: owerName,
      item_id,
      share,
    }));

  return [...otherClaims, ...draftClaims];
}

type MultiQtyUnitPickerProps = {
  item: BillItem;
  claimedQty: number;
  maxClaimable: number;
  othersClaimed: number;
  onQuantityChange: (quantity: number) => void;
};

function MultiQtyUnitPicker({
  item,
  claimedQty,
  maxClaimable,
  othersClaimed,
  onQuantityChange,
}: MultiQtyUnitPickerProps) {
  function handleUnitClick(unitIndex: number) {
    const taken = unitIndex < othersClaimed;
    if (taken) {
      return;
    }

    const yours = unitIndex < othersClaimed + claimedQty;
    const nextQuantity = yours
      ? unitIndex - othersClaimed
      : unitIndex - othersClaimed + 1;

    onQuantityChange(nextQuantity);
  }

  const unitLabel = formatUnitClaimLabel(claimedQty, item.qty);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs">Tap each one you had</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: item.qty }, (_, unitIndex) => {
          const taken = unitIndex < othersClaimed;
          const yours = !taken && unitIndex < othersClaimed + claimedQty;

          return (
            <button
              key={unitIndex}
              type="button"
              disabled={taken}
              aria-label={
                taken
                  ? `${item.name} ${unitIndex + 1} already claimed`
                  : yours
                    ? `Remove ${item.name} ${unitIndex + 1} from your claim`
                    : `Claim ${item.name} ${unitIndex + 1}`
              }
              aria-pressed={yours}
              onClick={() => handleUnitClick(unitIndex)}
              className={cn(
                "size-11 rounded-lg border text-sm font-medium tabular-nums transition-colors",
                taken &&
                  "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
                yours && "border-primary bg-primary/10 text-primary",
                !taken &&
                  !yours &&
                  "hover:border-primary/50 bg-background",
              )}
            >
              {unitIndex + 1}
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        {unitLabel ? (
          <>
            You&apos;re claiming <span className="font-medium">{unitLabel}</span>
            {othersClaimed > 0 ? (
              <>
                {" "}
                · {othersClaimed} already taken by others
              </>
            ) : null}
          </>
        ) : othersClaimed > 0 ? (
          <>
            {othersClaimed} already claimed by others · {maxClaimable} left for
            you
          </>
        ) : (
          `${maxClaimable} available`
        )}
      </p>
    </div>
  );
}

export function OwerItemPicker({
  items,
  totals,
  owerName,
  existingClaims,
  claimQuantities,
  onClaimQuantitiesChange,
}: OwerItemPickerProps) {
  const previewClaims = useMemo(
    () => buildPreviewClaims(existingClaims, owerName, claimQuantities),
    [claimQuantities, existingClaims, owerName],
  );

  const preview = useMemo(() => {
    return calculateOwerTotal({
      items,
      totals,
      claims: previewClaims,
      ower_name: owerName,
    });
  }, [items, owerName, previewClaims, totals]);

  function setQuantity(itemId: string, nextQuantity: number) {
    onClaimQuantitiesChange({
      ...claimQuantities,
      [itemId]: nextQuantity,
    });
  }

  function toggleSingleItem(itemId: string, checked: boolean) {
    setQuantity(itemId, checked ? 1 : 0);
  }

  const hasAnySelection = Object.values(claimQuantities).some(
    (quantity) => quantity > 0,
  );

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const claimedQty = claimQuantities[item.id] ?? 0;
        const maxClaimable = getMaxClaimableUnits(
          item,
          existingClaims,
          owerName,
        );
        const othersClaimed = getOthersClaimedUnits(
          item.id,
          existingClaims,
          owerName,
        );
        const lineTotal = itemLineTotal(item);
        const isMultiQty = item.qty > 1;
        const claimantCount = getItemClaimantCount(item.id, previewClaims);
        const splitLabel = formatSplitBetweenPeople(claimantCount);
        const othersSharing =
          !isMultiQty &&
          getItemClaimantCount(item.id, existingClaims) > 0 &&
          claimedQty === 0;

        return (
          <div
            key={item.id}
            className={cn(
              "shadow-card rounded-xl border bg-card p-4 transition-all",
              "hover:border-primary/20",
              claimedQty > 0 && "border-primary/40 bg-primary/5",
            )}
          >
            {!isMultiQty ? (
              <label
                htmlFor={`claim-${item.id}`}
                className="flex cursor-pointer items-start gap-3"
              >
                <Checkbox
                  id={`claim-${item.id}`}
                  checked={claimedQty > 0}
                  onCheckedChange={(nextChecked) =>
                    toggleSingleItem(item.id, nextChecked === true)
                  }
                  className="mt-1 size-5"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{item.name}</p>
                    <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                      {formatMoney(lineTotal)}
                    </span>
                  </div>
                  {splitLabel ? (
                    <p className="text-primary text-sm font-medium">
                      {splitLabel}
                    </p>
                  ) : othersSharing ? (
                    <p className="text-muted-foreground text-sm">
                      {formatSplitBetweenPeople(
                        getItemClaimantCount(item.id, existingClaims),
                      )}
                    </p>
                  ) : null}
                </div>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium leading-snug">{item.name}</p>
                    <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                      {formatMoney(lineTotal)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {item.qty} × {formatMoney(item.price)}
                  </p>
                  {splitLabel ? (
                    <p className="text-primary text-sm font-medium">
                      {splitLabel}
                    </p>
                  ) : othersSharing ? (
                    <p className="text-muted-foreground text-sm">
                      {formatSplitBetweenPeople(
                        getItemClaimantCount(item.id, existingClaims),
                      )}
                    </p>
                  ) : null}
                </div>

                <MultiQtyUnitPicker
                  item={item}
                  claimedQty={claimedQty}
                  maxClaimable={maxClaimable}
                  othersClaimed={othersClaimed}
                  onQuantityChange={(quantity) =>
                    setQuantity(item.id, quantity)
                  }
                />
              </div>
            )}
          </div>
        );
      })}

      {preview && hasAnySelection ? (
        <div className="text-muted-foreground flex justify-between text-sm">
          <span>Subtotal (before tax & tip)</span>
          <MoneyAmount amount={preview.subtotal} size="sm" />
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
  claimQuantities: ClaimQuantities,
): number {
  return useMemo(() => {
    const claims = buildPreviewClaims(
      existingClaims,
      owerName,
      claimQuantities,
    );
    const result = calculateOwerTotal({
      items,
      totals,
      claims,
      ower_name: owerName,
    });

    return result?.total ?? 0;
  }, [claimQuantities, existingClaims, items, owerName, totals]);
}
