import { listBillsByPayerId, normalizeBill } from "@/lib/db/bills";
import type { BillRow } from "@/lib/database.types";

export type PayerBillSummary = {
  id: string;
  createdAt: string;
  total: number;
  itemCount: number;
  participantCount: number;
};

export function toPayerBillSummary(bill: BillRow): PayerBillSummary {
  const normalized = normalizeBill({ ...bill, claims: [] });

  return {
    id: bill.id,
    createdAt: bill.created_at,
    total: normalized.totals.total,
    itemCount: normalized.items.length,
    participantCount: normalized.participants.length,
  };
}

export async function getPayerBillSummaries(
  payerId: string,
): Promise<PayerBillSummary[]> {
  const bills = await listBillsByPayerId(payerId);
  return bills.map(toPayerBillSummary);
}
