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
  claimed_share: number;
  paid_share: number;
  percent_paid: number;
  claimants: ItemClaimant[];
  status: "unclaimed" | "pending" | "settled";
};

function itemCost(item: BillItem): number {
  return Math.round(item.price * item.qty * 100) / 100;
}

/** Per-item settlement progress from claims and paid ower names. */
export function calculateItemProgress(input: {
  items: BillItem[];
  claims: SplitClaim[];
  paidOwerNames: Set<string>;
}): ItemProgress[] {
  const claimsByItem = new Map<string, SplitClaim[]>();

  for (const claim of input.claims) {
    if (claim.share <= 0) {
      continue;
    }

    const existing = claimsByItem.get(claim.item_id) ?? [];
    existing.push(claim);
    claimsByItem.set(claim.item_id, existing);
  }

  return input.items.map((item) => {
    const itemClaims = claimsByItem.get(item.id) ?? [];
    const claimants: ItemClaimant[] = itemClaims.map((claim) => ({
      ower_name: claim.ower_name,
      share: claim.share,
      paid: input.paidOwerNames.has(claim.ower_name),
    }));

    const claimedShare = claimants.reduce((sum, claimant) => sum + claimant.share, 0);
    const paidShare = claimants
      .filter((claimant) => claimant.paid)
      .reduce((sum, claimant) => sum + claimant.share, 0);

    const percentPaid =
      claimedShare > 0 ? Math.round((paidShare / claimedShare) * 100) : 0;

    let status: ItemProgress["status"] = "unclaimed";
    if (claimedShare > 0 && paidShare >= claimedShare) {
      status = "settled";
    } else if (claimedShare > 0) {
      status = "pending";
    }

    return {
      item_id: item.id,
      item_name: item.name,
      item_cost: itemCost(item),
      claimed_share: claimedShare,
      paid_share: paidShare,
      percent_paid: percentPaid,
      claimants,
      status,
    };
  });
}
