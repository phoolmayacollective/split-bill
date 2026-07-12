import {
  splitCountFromShare,
  type BillUnit,
} from "@/lib/bill-units";
import type { SplitClaim } from "@/lib/split";

export function getItemClaimantCount(
  unitId: string,
  claims: SplitClaim[],
): number {
  return new Set(
    claims
      .filter((claim) => claim.item_id === unitId && claim.share > 0)
      .map((claim) => claim.ower_name),
  ).size;
}

export function formatSplitBetweenPeople(count: number): string | null {
  if (count <= 1) {
    return null;
  }

  return `Split ${count} ways`;
}

export function formatSplitSlotsTaken(
  claimantCount: number,
  splitCount: number,
): string {
  return `${claimantCount} of ${splitCount} spots claimed`;
}

export function formatClaimedPercent(claimedFraction: number): string {
  return `${Math.round(claimedFraction * 100)}% claimed`;
}

export function getLineSplitLabel(
  _unit: BillUnit,
  claim: { share: number },
  unitClaims: SplitClaim[],
): string | null {
  const splitCount = splitCountFromShare(claim.share);
  const peopleLabel = formatSplitBetweenPeople(splitCount);

  if (!peopleLabel) {
    return null;
  }

  if (unitClaims.length < splitCount) {
    return `${peopleLabel} · ${formatSplitSlotsTaken(unitClaims.length, splitCount)}`;
  }

  return peopleLabel;
}
