import {
  expandBillItems,
  formatUnitLabel,
  normalizeClaimsToUnits,
  countUnitsForItem,
  type BillUnit,
} from "@/lib/bill-units";
import type { BillItem, BillTotals } from "@/lib/database.types";
import { getLineSplitLabel } from "@/lib/item-split-display";

export type SplitClaim = {
  ower_name: string;
  item_id: string;
  share: number;
};

export type OwerItemLine = {
  item_id: string;
  item_name: string;
  amount: number;
  split_label: string | null;
};

export type OwerSplitResult = {
  ower_name: string;
  subtotal: number;
  tax_share: number;
  tip_share: number;
  total: number;
  lines: OwerItemLine[];
};

export type OwerSummary = OwerSplitResult & {
  paid_at: string | null;
};

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function groupClaimsByUnit(claims: SplitClaim[]): Map<string, SplitClaim[]> {
  const map = new Map<string, SplitClaim[]>();

  for (const claim of claims) {
    if (claim.share <= 0) {
      continue;
    }

    const existing = map.get(claim.item_id) ?? [];
    existing.push(claim);
    map.set(claim.item_id, existing);
  }

  return map;
}

/** Scale tax/tip to the claimed portion of the bill, then split among owers. */
function allocateTaxOrTip(
  amount: number,
  billSubtotal: number,
  claimedSubtotal: number,
  owerSubtotals: Map<string, number>,
): Map<string, number> {
  if (
    amount === 0 ||
    billSubtotal <= 0 ||
    claimedSubtotal <= 0 ||
    owerSubtotals.size === 0
  ) {
    return new Map();
  }

  const pool = roundMoney((amount * claimedSubtotal) / billSubtotal);
  return distributeProportionally(pool, owerSubtotals);
}

function claimLineAmount(unit: BillUnit, claim: SplitClaim): number {
  return roundMoney(unit.price * claim.share);
}

function distributeProportionally(
  amount: number,
  weights: Map<string, number>,
): Map<string, number> {
  const result = new Map<string, number>();
  const names = [...weights.keys()];

  if (names.length === 0 || amount === 0) {
    return result;
  }

  const totalWeight = names.reduce((sum, name) => sum + (weights.get(name) ?? 0), 0);

  if (totalWeight === 0) {
    for (const name of names) {
      result.set(name, 0);
    }
    return result;
  }

  let assigned = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const weight = weights.get(name) ?? 0;

    if (i === names.length - 1) {
      result.set(name, roundMoney(amount - assigned));
      continue;
    }

    const share = roundMoney((amount * weight) / totalWeight);
    result.set(name, share);
    assigned = roundMoney(assigned + share);
  }

  return result;
}

/**
 * Compute per-ower amounts from bill items, tax/tip totals, and unit claims.
 * Each claim share is a fraction of one unit (e.g. 1/3 = 0.3333).
 */
export function calculateSplits(input: {
  items: BillItem[];
  totals: BillTotals;
  claims: SplitClaim[];
}): OwerSplitResult[] {
  const units = expandBillItems(input.items);
  const unitsById = new Map(units.map((unit) => [unit.id, unit]));
  const itemsById = new Map(input.items.map((item) => [item.id, item]));
  const normalizedClaims = normalizeClaimsToUnits(input.claims, input.items);
  const claimsByUnit = groupClaimsByUnit(normalizedClaims);

  const owerSubtotals = new Map<string, number>();
  const owerLines = new Map<string, OwerItemLine[]>();

  for (const [unitId, unitClaims] of claimsByUnit) {
    const unit = unitsById.get(unitId);
    if (!unit) {
      continue;
    }

    const parent = itemsById.get(unit.parentItemId);
    const unitCount = parent ? countUnitsForItem(parent) : 1;
    const lineName = formatUnitLabel(unit, unitCount);

    for (const claim of unitClaims) {
      const amount = claimLineAmount(unit, claim);
      const lines = owerLines.get(claim.ower_name) ?? [];
      lines.push({
        item_id: unit.id,
        item_name: lineName,
        amount,
        split_label: getLineSplitLabel(unit, claim, unitClaims),
      });
      owerLines.set(claim.ower_name, lines);

      const current = owerSubtotals.get(claim.ower_name) ?? 0;
      owerSubtotals.set(claim.ower_name, roundMoney(current + amount));
    }
  }

  const claimedSubtotal = [...owerSubtotals.values()].reduce(
    (sum, value) => roundMoney(sum + value),
    0,
  );

  const billSubtotal = input.totals.subtotal;

  const taxShares = allocateTaxOrTip(
    input.totals.tax,
    billSubtotal,
    claimedSubtotal,
    owerSubtotals,
  );
  const tipShares = allocateTaxOrTip(
    input.totals.tip,
    billSubtotal,
    claimedSubtotal,
    owerSubtotals,
  );

  const owerNames = [...new Set([...owerSubtotals.keys()])].sort();

  return owerNames.map((ower_name) => {
    const subtotal = owerSubtotals.get(ower_name) ?? 0;
    const tax_share = taxShares.get(ower_name) ?? 0;
    const tip_share = tipShares.get(ower_name) ?? 0;

    return {
      ower_name,
      subtotal,
      tax_share,
      tip_share,
      total: roundMoney(subtotal + tax_share + tip_share),
      lines: owerLines.get(ower_name) ?? [],
    };
  });
}

/** Preview total for one ower (e.g. live UI while selecting items). */
export function calculateOwerTotal(input: {
  items: BillItem[];
  totals: BillTotals;
  claims: SplitClaim[];
  ower_name: string;
}): OwerSplitResult | null {
  const results = calculateSplits(input);
  return results.find((result) => result.ower_name === input.ower_name) ?? null;
}
