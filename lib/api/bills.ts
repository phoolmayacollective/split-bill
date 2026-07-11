import type { BillWithClaims } from "@/lib/database.types";
import { normalizeBill } from "@/lib/db/bills";

export type PublicBill = ReturnType<typeof toPublicBill>;

function hasEncryptedPayment(bill: BillWithClaims): boolean {
  return Boolean(
    bill.payment_enc &&
      bill.payment_iv &&
      bill.payment_salt &&
      bill.kdf_iterations,
  );
}

/** Public bill shape — includes ciphertext for client-side decrypt, never plaintext payment fields. */
export function toPublicBill(bill: BillWithClaims) {
  const normalized = normalizeBill(bill);

  return {
    id: normalized.id,
    items: normalized.items,
    totals: normalized.totals,
    participants: normalized.participants,
    created_at: normalized.created_at,
    claims: normalized.claims.map((claim) => ({
      id: claim.id,
      bill_id: claim.bill_id,
      ower_name: claim.ower_name,
      item_id: claim.item_id,
      share: Number(claim.share),
      created_at: claim.created_at,
    })),
    ...(hasEncryptedPayment(normalized)
      ? {
          payment_enc: normalized.payment_enc,
          payment_iv: normalized.payment_iv,
          payment_salt: normalized.payment_salt,
          kdf_iterations: normalized.kdf_iterations,
        }
      : {}),
  };
}
