import {
  expandBillItems,
  formatUnitLabel,
  normalizeClaimsToUnits,
  countUnitsForItem,
} from "@/lib/bill-units";
import type { BillItem } from "@/lib/database.types";
import type { SplitClaim } from "@/lib/split";

export type ItemClaimant = {
  ower_name: string;
  share: number;
  paid: boolean;
};

export type ItemProgress = {
  item_id: string;
  item_name: string;
  item_cost: number;
  item_qty: number;
  claimed_share: number;
  paid_share: number;
  percent_paid: number;
  percent_claimed: number;
  claimants: ItemClaimant[];
  status: "unclaimed" | "pending" | "settled";
};

const SHARE_EPSILON = 0.0001;

/** Per-unit settlement progress from claims and paid ower names. */
export function calculateItemProgress(input: {
  items: BillItem[];
  claims: SplitClaim[];
  paidOwerNames: Set<string>;
}): ItemProgress[] {
  const units = expandBillItems(input.items);
  const itemsById = new Map(input.items.map((item) => [item.id, item]));
  const normalizedClaims = normalizeClaimsToUnits(input.claims, input.items);
  const claimsByUnit = new Map<string, SplitClaim[]>();

  for (const claim of normalizedClaims) {
    if (claim.share <= 0) {
      continue;
    }

    const existing = claimsByUnit.get(claim.item_id) ?? [];
    existing.push(claim);
    claimsByUnit.set(claim.item_id, existing);
  }

  return units.map((unit) => {
    const unitClaims = claimsByUnit.get(unit.id) ?? [];
    const claimants: ItemClaimant[] = unitClaims.map((claim) => ({
      ower_name: claim.ower_name,
      share: claim.share,
      paid: input.paidOwerNames.has(claim.ower_name),
    }));

    const claimedShare = Math.min(
      1,
      claimants.reduce((sum, claimant) => sum + claimant.share, 0),
    );
    const paidShare = claimants
      .filter((claimant) => claimant.paid)
      .reduce((sum, claimant) => sum + claimant.share, 0);

    const percentClaimed = Math.round(claimedShare * 100);
    const percentPaid = Math.round(paidShare * 100);

    let status: ItemProgress["status"] = "unclaimed";
    if (claimedShare >= 1 - SHARE_EPSILON && paidShare >= claimedShare - SHARE_EPSILON) {
      status = "settled";
    } else if (claimedShare > 0) {
      status = "pending";
    }

    const parent = itemsById.get(unit.parentItemId);
    const unitCount = parent ? countUnitsForItem(parent) : 1;

    return {
      item_id: unit.id,
      item_name: formatUnitLabel(unit, unitCount),
      item_cost: unit.price,
      item_qty: 1,
      claimed_share: claimedShare,
      paid_share: paidShare,
      percent_paid: percentPaid,
      percent_claimed: percentClaimed,
      claimants,
      status,
    };
  });
}
