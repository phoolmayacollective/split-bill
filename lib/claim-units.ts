import {
  expandBillItems,
  getClaimsForUnit,
  normalizeClaimsToUnits,
  shareFromSplitCount,
  splitCountFromShare,
  type BillUnit,
} from "@/lib/bill-units";
import type { BillItem } from "@/lib/database.types";
import type { SplitClaim } from "@/lib/split";

const SHARE_EPSILON = 0.0001;

/** Per-unit claim draft while the ower is selecting items. */
export type UnitClaimDraft = {
  enabled: boolean;
  splitCount: number;
};

export type ClaimDraft = Record<string, UnitClaimDraft>;

/** unit_id → fractional share (0–1) sent to the API. */
export type ClaimQuantities = Record<string, number>;

export type UnitPoolInfo = {
  splitCount: number | null;
  claimedFraction: number;
  claimantCount: number;
  slotsRemaining: number;
  isFull: boolean;
  canJoin: boolean;
};

export function getOwerClaimDraft(
  owerName: string,
  units: BillUnit[],
  existingClaims: SplitClaim[],
): ClaimDraft {
  const draft: ClaimDraft = {};

  for (const unit of units) {
    const mine = getClaimsForUnit(unit.id, existingClaims).find(
      (claim) => claim.ower_name === owerName,
    );

    if (mine) {
      draft[unit.id] = {
        enabled: true,
        splitCount: splitCountFromShare(mine.share),
      };
    }
  }

  return draft;
}

export function draftToQuantities(draft: ClaimDraft): ClaimQuantities {
  const quantities: ClaimQuantities = {};

  for (const [unitId, state] of Object.entries(draft)) {
    if (!state.enabled || state.splitCount < 1) {
      continue;
    }

    quantities[unitId] = shareFromSplitCount(state.splitCount);
  }

  return quantities;
}

export function getOwerClaimQuantities(
  owerName: string,
  existingClaims: SplitClaim[],
): ClaimQuantities {
  const quantities: ClaimQuantities = {};

  for (const claim of existingClaims) {
    if (claim.ower_name !== owerName || claim.share <= 0) {
      continue;
    }

    quantities[claim.item_id] = Number(claim.share);
  }

  return quantities;
}

export function getUnitPoolInfo(
  unitId: string,
  claims: SplitClaim[],
  owerName: string,
): UnitPoolInfo {
  const unitClaims = getClaimsForUnit(unitId, claims);
  const claimedFraction = unitClaims.reduce(
    (sum, claim) => sum + Number(claim.share),
    0,
  );
  const claimantCount = unitClaims.length;
  const splitCount =
    unitClaims.length > 0
      ? splitCountFromShare(unitClaims[0].share)
      : null;
  const expectedSlots = splitCount ?? 0;
  const slotsRemaining = splitCount
    ? Math.max(0, expectedSlots - claimantCount)
    : Number.POSITIVE_INFINITY;
  const alreadyClaimed = unitClaims.some(
    (claim) => claim.ower_name === owerName,
  );
  const isFull = claimedFraction >= 1 - SHARE_EPSILON;

  return {
    splitCount,
    claimedFraction,
    claimantCount,
    slotsRemaining,
    isFull,
    canJoin: !isFull && !alreadyClaimed && slotsRemaining > 0,
  };
}

export function hasAnyClaim(draft: ClaimDraft): boolean {
  return Object.values(draft).some((state) => state.enabled);
}

export function toClaimPayload(
  quantities: ClaimQuantities,
): Array<{ item_id: string; share: number }> {
  return Object.entries(quantities)
    .filter(([, share]) => share > 0)
    .map(([item_id, share]) => ({ item_id, share }));
}

export function claimsMatchDraft(
  existingClaims: SplitClaim[],
  owerName: string,
  units: BillUnit[],
  draft: ClaimDraft,
): boolean {
  const existing = getOwerClaimDraft(owerName, units, existingClaims);
  const unitIds = new Set([
    ...Object.keys(existing),
    ...Object.keys(draft),
  ]);

  for (const unitId of unitIds) {
    const before = existing[unitId];
    const after = draft[unitId];

    if (!before && !after) {
      continue;
    }

    if (!before || !after) {
      return false;
    }

    if (
      before.enabled !== after.enabled ||
      before.splitCount !== after.splitCount
    ) {
      return false;
    }
  }

  return true;
}

export function validateClaimDraft(
  items: BillItem[],
  existingClaims: SplitClaim[],
  owerName: string,
  draft: ClaimDraft,
): string | null {
  const units = expandBillItems(items);
  const unitIds = new Set(units.map((unit) => unit.id));
  const normalizedClaims = normalizeClaimsToUnits(existingClaims, items);
  const quantities = draftToQuantities(draft);
  const payload = toClaimPayload(quantities);

  for (const claim of payload) {
    if (!unitIds.has(claim.item_id)) {
      return "One or more items are no longer on this bill.";
    }

    const state = draft[claim.item_id];
    if (!state?.enabled) {
      return "Select at least one item you owe.";
    }

    const othersClaims = normalizedClaims.filter(
      (row) => row.item_id === claim.item_id && row.ower_name !== owerName,
    );
    const pool = getUnitPoolInfo(claim.item_id, othersClaims, owerName);

    if (pool.splitCount !== null && state.splitCount !== pool.splitCount) {
      return `This item is already split ${pool.splitCount} ways. Join with the same split.`;
    }

    if (!pool.canJoin && !getClaimsForUnit(claim.item_id, normalizedClaims).some(
      (row) => row.ower_name === owerName,
    )) {
      return "That item is already fully claimed.";
    }

    const mergedClaims: SplitClaim[] = [
      ...othersClaims,
      {
        ower_name: owerName,
        item_id: claim.item_id,
        share: claim.share,
      },
    ];
    const totalClaimed = mergedClaims.reduce(
      (sum, row) => sum + Number(row.share),
      0,
    );

    if (totalClaimed > 1 + SHARE_EPSILON) {
      return "Not enough room left on that item for your claim.";
    }

    const splitCounts = new Set(
      mergedClaims.map((row) => splitCountFromShare(row.share)),
    );

    if (splitCounts.size > 1) {
      return "Everyone on the same item must use the same split size.";
    }
  }

  return null;
}

export function validateClaimQuantities(
  items: BillItem[],
  existingClaims: SplitClaim[],
  owerName: string,
  quantities: ClaimQuantities,
): string | null {
  const draft: ClaimDraft = {};

  for (const [unitId, share] of Object.entries(quantities)) {
    if (share > 0) {
      draft[unitId] = {
        enabled: true,
        splitCount: splitCountFromShare(share),
      };
    }
  }

  return validateClaimDraft(items, existingClaims, owerName, draft);
}
