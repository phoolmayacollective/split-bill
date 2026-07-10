import type { BillWithClaims } from "@/lib/database.types";
import { normalizeBill } from "@/lib/db/bills";

/** Strip payment ciphertext fields from API responses in phase 1. */
export function toPublicBill(bill: BillWithClaims) {
  const normalized = normalizeBill(bill);

  return {
    id: normalized.id,
    items: normalized.items,
    totals: normalized.totals,
    created_at: normalized.created_at,
    claims: normalized.claims.map((claim) => ({
      id: claim.id,
      bill_id: claim.bill_id,
      ower_name: claim.ower_name,
      item_id: claim.item_id,
      share: Number(claim.share),
      created_at: claim.created_at,
    })),
  };
}
