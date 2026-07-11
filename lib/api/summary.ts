import { getOwerPayments } from "@/lib/db/ower-payments";
import { normalizeBill } from "@/lib/db/bills";
import type { BillWithClaims } from "@/lib/database.types";
import { calculateSplits, type OwerSummary } from "@/lib/split";

export async function getBillOwerSummaries(
  bill: BillWithClaims,
): Promise<OwerSummary[]> {
  const normalized = normalizeBill(bill);
  const [payments, owers] = await Promise.all([
    getOwerPayments(bill.id),
    Promise.resolve(
      calculateSplits({
        items: normalized.items,
        totals: normalized.totals,
        claims: normalized.claims.map((claim) => ({
          ower_name: claim.ower_name,
          item_id: claim.item_id,
          share: Number(claim.share),
        })),
      }),
    ),
  ]);

  const paidByName = new Map(
    payments.map((payment) => [payment.ower_name, payment.paid_at]),
  );

  return owers.map((ower) => ({
    ...ower,
    paid_at: paidByName.get(ower.ower_name) ?? null,
  }));
}

export function owerHasClaims(
  bill: BillWithClaims,
  owerName: string,
): boolean {
  const trimmed = owerName.trim();
  return bill.claims.some((claim) => claim.ower_name === trimmed);
}
