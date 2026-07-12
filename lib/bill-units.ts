import type { BillItem } from "@/lib/database.types";
import type { SplitClaim } from "@/lib/split";

export const UNIT_ID_SEP = "::";

export type BillUnit = {
  id: string;
  parentItemId: string;
  unitIndex: number;
  name: string;
  price: number;
};

export function makeUnitId(parentItemId: string, unitIndex: number): string {
  return `${parentItemId}${UNIT_ID_SEP}${unitIndex}`;
}

export function parseUnitId(
  unitId: string,
): { parentItemId: string; unitIndex: number } | null {
  const sepIndex = unitId.lastIndexOf(UNIT_ID_SEP);
  if (sepIndex === -1) {
    return null;
  }

  const parentItemId = unitId.slice(0, sepIndex);
  const unitIndex = Number(unitId.slice(sepIndex + UNIT_ID_SEP.length));

  if (!parentItemId || !Number.isInteger(unitIndex) || unitIndex < 0) {
    return null;
  }

  return { parentItemId, unitIndex };
}

/** Expand bill line items into one row per physical unit. */
export function expandBillItems(items: BillItem[]): BillUnit[] {
  const units: BillUnit[] = [];

  for (const item of items) {
    const count = Math.max(1, Math.floor(item.qty));

    for (let unitIndex = 0; unitIndex < count; unitIndex++) {
      units.push({
        id: makeUnitId(item.id, unitIndex),
        parentItemId: item.id,
        unitIndex,
        name: item.name,
        price: item.price,
      });
    }
  }

  return units;
}

export function getUnitIds(items: BillItem[]): Set<string> {
  return new Set(expandBillItems(items).map((unit) => unit.id));
}

/** Map legacy parent-item claims onto the first unit of each line. */
export function normalizeClaimsToUnits(
  claims: SplitClaim[],
  items: BillItem[],
): SplitClaim[] {
  const unitIds = getUnitIds(items);

  return claims.map((claim) => {
    if (unitIds.has(claim.item_id)) {
      return claim;
    }

    const parent = items.find((item) => item.id === claim.item_id);
    if (!parent) {
      return claim;
    }

    return {
      ...claim,
      item_id: makeUnitId(parent.id, 0),
    };
  });
}

export function getClaimsForUnit(
  unitId: string,
  claims: SplitClaim[],
): SplitClaim[] {
  return claims.filter(
    (claim) => claim.item_id === unitId && claim.share > 0,
  );
}

export function shareFromSplitCount(splitCount: number): number {
  return Math.round((1 / splitCount) * 10000) / 10000;
}

export function splitCountFromShare(share: number): number {
  if (share <= 0) {
    return 1;
  }

  return Math.max(1, Math.round(1 / share));
}

export function formatUnitLabel(unit: BillUnit, _totalUnits: number): string {
  return unit.name;
}

export function countUnitsForItem(item: BillItem): number {
  return Math.max(1, Math.floor(item.qty));
}
