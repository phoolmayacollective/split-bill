import type { BillItem } from "@/lib/database.types";
import type { SplitClaim } from "@/lib/split";

/** item_id → units claimed (0 = not claimed). */
export type ClaimQuantities = Record<string, number>;

export function getOwerClaimQuantities(
  owerName: string,
  existingClaims: SplitClaim[],
): ClaimQuantities {
  const quantities: ClaimQuantities = {};

  for (const claim of existingClaims) {
    if (claim.ower_name !== owerName) {
      continue;
    }

    quantities[claim.item_id] =
      (quantities[claim.item_id] ?? 0) + Number(claim.share);
  }

  return quantities;
}

export function getOthersClaimedUnits(
  itemId: string,
  existingClaims: SplitClaim[],
  owerName: string,
): number {
  return existingClaims
    .filter(
      (claim) => claim.item_id === itemId && claim.ower_name !== owerName,
    )
    .reduce((sum, claim) => sum + Number(claim.share), 0);
}

export function getMaxClaimableUnits(
  item: BillItem,
  existingClaims: SplitClaim[],
  owerName: string,
): number {
  if (item.qty <= 1) {
    return 1;
  }

  const others = getOthersClaimedUnits(item.id, existingClaims, owerName);
  return Math.max(0, item.qty - others);
}

export function hasAnyClaim(quantities: ClaimQuantities): boolean {
  return Object.values(quantities).some((share) => share > 0);
}

export function toClaimPayload(
  quantities: ClaimQuantities,
): Array<{ item_id: string; share: number }> {
  return Object.entries(quantities)
    .filter(([, share]) => share > 0)
    .map(([item_id, share]) => ({ item_id, share }));
}

export function claimsMatchQuantities(
  existingClaims: SplitClaim[],
  owerName: string,
  quantities: ClaimQuantities,
): boolean {
  const existing = getOwerClaimQuantities(owerName, existingClaims);
  const itemIds = new Set([
    ...Object.keys(existing),
    ...Object.keys(quantities),
  ]);

  for (const itemId of itemIds) {
    if ((existing[itemId] ?? 0) !== (quantities[itemId] ?? 0)) {
      return false;
    }
  }

  return true;
}

export function validateClaimQuantities(
  items: BillItem[],
  existingClaims: SplitClaim[],
  owerName: string,
  quantities: ClaimQuantities,
): string | null {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const payload = toClaimPayload(quantities);

  for (const claim of payload) {
    const item = itemsById.get(claim.item_id);
    if (!item) {
      return "One or more items are no longer on this bill.";
    }

    if (item.qty > 1) {
      if (!Number.isInteger(claim.share)) {
        return `Claim quantity for ${item.name} must be a whole number.`;
      }

      const max = getMaxClaimableUnits(item, existingClaims, owerName);
      if (claim.share > max) {
        return `You can claim at most ${max} of ${item.name} (${item.qty} on the bill).`;
      }
    }
  }

  const mergedClaims: SplitClaim[] = [
    ...existingClaims.filter((claim) => claim.ower_name !== owerName),
    ...payload.map((claim) => ({
      ower_name: owerName,
      item_id: claim.item_id,
      share: claim.share,
    })),
  ];

  for (const item of items) {
    if (item.qty <= 1) {
      continue;
    }

    const totalClaimed = mergedClaims
      .filter((claim) => claim.item_id === item.id)
      .reduce((sum, claim) => sum + Number(claim.share), 0);

    if (totalClaimed > item.qty) {
      return `Only ${item.qty} of ${item.name} are on the bill.`;
    }
  }

  return null;
}
