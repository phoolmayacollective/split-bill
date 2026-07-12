"use client";

import { useMemo } from "react";

import { MoneyAmount } from "@/components/bill/money-amount";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/bill-totals";
import {
  expandBillItems,
  formatUnitLabel,
  countUnitsForItem,
} from "@/lib/bill-units";
import {
  type ClaimDraft,
  draftToQuantities,
  getUnitPoolInfo,
} from "@/lib/claim-units";
import {
  formatClaimedPercent,
  formatSplitBetweenPeople,
  formatSplitSlotsTaken,
} from "@/lib/item-split-display";
import { cn } from "@/lib/utils";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { calculateOwerTotal, type SplitClaim } from "@/lib/split";

type OwerItemPickerProps = {
  items: BillItem[];
  totals: BillTotals;
  owerName: string;
  existingClaims: SplitClaim[];
  claimDraft: ClaimDraft;
  onClaimDraftChange: (draft: ClaimDraft) => void;
};

function buildPreviewClaims(
  existingClaims: SplitClaim[],
  owerName: string,
  claimDraft: ClaimDraft,
): SplitClaim[] {
  const otherClaims = existingClaims.filter(
    (claim) => claim.ower_name !== owerName,
  );

  const draftClaims = Object.entries(draftToQuantities(claimDraft)).map(
    ([item_id, share]) => ({
      ower_name: owerName,
      item_id,
      share,
    }),
  );

  return [...otherClaims, ...draftClaims];
}

type UnitRowProps = {
  unitId: string;
  name: string;
  price: number;
  enabled: boolean;
  splitCount: number;
  splitLocked: boolean;
  poolLabel: string | null;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
  onSplitCountChange: (splitCount: number) => void;
};

function UnitRow({
  unitId,
  name,
  price,
  enabled,
  splitCount,
  splitLocked,
  poolLabel,
  disabled,
  onToggle,
  onSplitCountChange,
}: UnitRowProps) {
  return (
    <div
      className={cn(
        "shadow-card rounded-xl border bg-card p-4 transition-all",
        "hover:border-primary/20",
        enabled && "border-primary/40 bg-primary/5",
        disabled && "opacity-70",
      )}
    >
      <label
        htmlFor={`claim-${unitId}`}
        className={cn(
          "flex items-start gap-3",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <Checkbox
          id={`claim-${unitId}`}
          checked={enabled}
          disabled={disabled}
          onCheckedChange={(nextChecked) => onToggle(nextChecked === true)}
          className="mt-1 size-5"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-medium leading-snug">{name}</p>
            <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
              {formatMoney(price)}
            </span>
          </div>
          {poolLabel ? (
            <p className="text-primary text-sm font-medium">{poolLabel}</p>
          ) : null}
        </div>
      </label>

      {enabled ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-muted-foreground text-sm">Split with</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={splitLocked || splitCount <= 1}
              aria-label="Fewer people"
              onClick={() => onSplitCountChange(splitCount - 1)}
            >
              −
            </Button>
            <span className="min-w-8 text-center text-sm font-medium tabular-nums">
              {splitCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-9"
              disabled={splitLocked || splitCount >= 12}
              aria-label="More people"
              onClick={() => onSplitCountChange(splitCount + 1)}
            >
              +
            </Button>
            <span className="text-muted-foreground text-sm">
              {splitCount === 1 ? "person (just me)" : "people"}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OwerItemPicker({
  items,
  totals,
  owerName,
  existingClaims,
  claimDraft,
  onClaimDraftChange,
}: OwerItemPickerProps) {
  const units = useMemo(() => expandBillItems(items), [items]);
  const unitsByParent = useMemo(() => {
    const groups = new Map<string, typeof units>();

    for (const unit of units) {
      const group = groups.get(unit.parentItemId) ?? [];
      group.push(unit);
      groups.set(unit.parentItemId, group);
    }

    return groups;
  }, [units]);

  const previewClaims = useMemo(
    () => buildPreviewClaims(existingClaims, owerName, claimDraft),
    [claimDraft, existingClaims, owerName],
  );

  const preview = useMemo(() => {
    return calculateOwerTotal({
      items,
      totals,
      claims: previewClaims,
      ower_name: owerName,
    });
  }, [items, owerName, previewClaims, totals]);

  function updateUnit(
    unitId: string,
    patch: Partial<ClaimDraft[string]>,
  ) {
    const current = claimDraft[unitId] ?? { enabled: false, splitCount: 1 };

    onClaimDraftChange({
      ...claimDraft,
      [unitId]: {
        ...current,
        ...patch,
      },
    });
  }

  const hasAnySelection = Object.values(claimDraft).some((state) => state.enabled);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const itemUnits = unitsByParent.get(item.id) ?? [];
        const showGroupLabel = countUnitsForItem(item) > 1;

        return (
          <div key={item.id} className="space-y-2">
            {showGroupLabel ? (
              <p className="text-muted-foreground px-1 text-xs font-medium tracking-wide uppercase">
                {item.name} · {item.qty} × {formatMoney(item.price)}
              </p>
            ) : null}

            <div className="space-y-2">
              {itemUnits.map((unit) => {
                const state = claimDraft[unit.id] ?? {
                  enabled: false,
                  splitCount: 1,
                };
                const pool = getUnitPoolInfo(
                  unit.id,
                  previewClaims.filter((claim) => claim.ower_name !== owerName),
                  owerName,
                );
                const splitLocked =
                  pool.splitCount !== null &&
                  previewClaims.some(
                    (claim) =>
                      claim.item_id === unit.id &&
                      claim.ower_name !== owerName,
                  );
                const displaySplitCount = splitLocked
                  ? (pool.splitCount ?? state.splitCount)
                  : state.splitCount;
                const disabled = pool.isFull && !state.enabled;
                const unitLabel = formatUnitLabel(unit, itemUnits.length);

                let poolLabel: string | null = null;
                if (pool.splitCount !== null && !state.enabled) {
                  poolLabel = `${formatSplitBetweenPeople(pool.splitCount)} · ${formatSplitSlotsTaken(pool.claimantCount, pool.splitCount)}`;
                } else if (pool.claimedFraction > 0 && !state.enabled) {
                  poolLabel = formatClaimedPercent(pool.claimedFraction);
                } else if (state.enabled && displaySplitCount > 1) {
                  poolLabel = `Your share · ${formatMoney(unit.price / displaySplitCount)}`;
                }

                return (
                  <UnitRow
                    key={unit.id}
                    unitId={unit.id}
                    name={unitLabel}
                    price={unit.price}
                    enabled={state.enabled}
                    splitCount={displaySplitCount}
                    splitLocked={splitLocked}
                    poolLabel={poolLabel}
                    disabled={disabled}
                    onToggle={(checked) =>
                      updateUnit(unit.id, {
                        enabled: checked,
                        splitCount: pool.splitCount ?? state.splitCount ?? 1,
                      })
                    }
                    onSplitCountChange={(nextSplitCount) =>
                      updateUnit(unit.id, { splitCount: nextSplitCount })
                    }
                  />
                );
              })}
            </div>
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
  claimDraft: ClaimDraft,
): number {
  return useMemo(() => {
    const claims = buildPreviewClaims(existingClaims, owerName, claimDraft);
    const result = calculateOwerTotal({
      items,
      totals,
      claims,
      ower_name: owerName,
    });

    return result?.total ?? 0;
  }, [claimDraft, existingClaims, items, owerName, totals]);
}
