import type { ItemProgress } from "@/lib/item-progress";
import type { BillItem, BillTotals } from "@/lib/database.types";
import type { OwerSummary } from "@/lib/split";

export type PayerViewSnapshot = {
  items: BillItem[];
  totals: BillTotals;
  item_progress: ItemProgress[];
  owers: OwerSummary[];
  summary: {
    ower_count: number;
    paid_count: number;
    total_owed: number;
    total_paid: number;
  };
};

export function payerViewSignature(view: PayerViewSnapshot): string {
  return JSON.stringify({
    summary: view.summary,
    item_progress: view.item_progress.map((row) => ({
      id: row.item_id,
      status: row.status,
      claimed: row.percent_claimed,
      paid: row.percent_paid,
      claimants: row.claimants.map((claimant) => ({
        name: claimant.ower_name,
        share: claimant.share,
        paid: claimant.paid,
      })),
    })),
    owers: view.owers.map((ower) => ({
      name: ower.ower_name,
      total: ower.total,
      paid_at: ower.paid_at,
    })),
  });
}
