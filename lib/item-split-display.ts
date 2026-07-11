import type { SplitClaim } from "@/lib/split";

export function getItemClaimantCount(
  itemId: string,
  claims: SplitClaim[],
): number {
  return new Set(
    claims
      .filter((claim) => claim.item_id === itemId && claim.share > 0)
      .map((claim) => claim.ower_name),
  ).size;
}

export function formatSplitBetweenPeople(count: number): string | null {
  if (count <= 1) {
    return null;
  }

  return `Split between ${count} people`;
}

export function formatUnitClaimLabel(
  claimedUnits: number,
  totalUnits: number,
): string | null {
  if (totalUnits <= 1 || claimedUnits <= 0) {
    return null;
  }

  return `${claimedUnits} of ${totalUnits}`;
}

export function getLineSplitLabel(
  item: { id: string; qty: number },
  claim: { share: number },
  itemClaims: SplitClaim[],
): string | null {
  const claimantCount = getItemClaimantCount(item.id, itemClaims);

  if (item.qty > 1) {
    const unitLabel = formatUnitClaimLabel(claim.share, item.qty);
    if (unitLabel) {
      return unitLabel;
    }

    return formatSplitBetweenPeople(claimantCount);
  }

  return formatSplitBetweenPeople(claimantCount);
}
