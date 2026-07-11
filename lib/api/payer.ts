import { calculateItemProgress } from "@/lib/item-progress";
import { getBillOwerSummaries } from "@/lib/api/summary";
import { normalizeBill } from "@/lib/db/bills";
import type { BillWithClaims } from "@/lib/database.types";

export async function getBillPayerView(bill: BillWithClaims) {
  const normalized = normalizeBill(bill);
  const owers = await getBillOwerSummaries(bill);

  const paidOwerNames = new Set(
    owers.filter((ower) => ower.paid_at).map((ower) => ower.ower_name),
  );

  const itemProgress = calculateItemProgress({
    items: normalized.items,
    claims: normalized.claims.map((claim) => ({
      ower_name: claim.ower_name,
      item_id: claim.item_id,
      share: Number(claim.share),
    })),
    paidOwerNames,
  });

  const totalOwed = owers.reduce((sum, ower) => sum + ower.total, 0);
  const totalPaid = owers
    .filter((ower) => ower.paid_at)
    .reduce((sum, ower) => sum + ower.total, 0);

  return {
    items: normalized.items,
    totals: normalized.totals,
    item_progress: itemProgress,
    owers,
    summary: {
      ower_count: owers.length,
      paid_count: owers.filter((ower) => ower.paid_at).length,
      total_owed: Math.round(totalOwed * 100) / 100,
      total_paid: Math.round(totalPaid * 100) / 100,
    },
  };
}
