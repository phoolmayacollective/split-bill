import type {
  BillInsert,
  BillItem,
  BillRow,
  BillTotals,
  BillWithClaims,
  ClaimInsert,
  ClaimRow,
} from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase";

const defaultTotals: BillTotals = {
  subtotal: 0,
  tax: 0,
  tip: 0,
  total: 0,
};

function parseBillItems(items: BillRow["items"]): BillItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(
    (item): item is BillItem =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item &&
      "price" in item &&
      "qty" in item,
  );
}

function parseBillTotals(totals: BillRow["totals"]): BillTotals {
  if (typeof totals !== "object" || totals === null || Array.isArray(totals)) {
    return defaultTotals;
  }

  const record = totals as Record<string, unknown>;

  return {
    subtotal: Number(record.subtotal ?? 0),
    tax: Number(record.tax ?? 0),
    tip: Number(record.tip ?? 0),
    total: Number(record.total ?? 0),
  };
}

export async function createBill(input: {
  items: BillItem[];
  totals?: BillTotals;
}): Promise<BillRow> {
  const supabase = createServerSupabaseClient();

  const payload: BillInsert = {
    items: input.items,
    totals: input.totals ?? defaultTotals,
  };

  const { data, error } = await supabase
    .from("bills")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create bill: ${error.message}`);
  }

  return data;
}

export async function getBillById(id: string): Promise<BillWithClaims | null> {
  const supabase = createServerSupabaseClient();

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (billError) {
    throw new Error(`Failed to fetch bill: ${billError.message}`);
  }

  if (!bill) {
    return null;
  }

  const { data: claims, error: claimsError } = await supabase
    .from("claims")
    .select("*")
    .eq("bill_id", id)
    .order("created_at", { ascending: true });

  if (claimsError) {
    throw new Error(`Failed to fetch claims: ${claimsError.message}`);
  }

  return {
    ...bill,
    claims: claims ?? [],
  };
}

export async function updateBill(
  id: string,
  input: {
    items?: BillItem[];
    totals?: BillTotals;
    payment_enc?: string | null;
    payment_iv?: string | null;
    payment_salt?: string | null;
    kdf_iterations?: number | null;
  },
): Promise<BillRow> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bills")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update bill: ${error.message}`);
  }

  return data;
}

export async function addClaims(
  billId: string,
  claims: Array<Pick<ClaimInsert, "ower_name" | "item_id" | "share">>,
): Promise<ClaimRow[]> {
  const supabase = createServerSupabaseClient();

  const payload: ClaimInsert[] = claims.map((claim) => ({
    bill_id: billId,
    ower_name: claim.ower_name,
    item_id: claim.item_id,
    share: claim.share ?? 1,
  }));

  const { data, error } = await supabase
    .from("claims")
    .insert(payload)
    .select();

  if (error) {
    throw new Error(`Failed to add claims: ${error.message}`);
  }

  return data;
}

export function normalizeBill(bill: BillWithClaims) {
  return {
    ...bill,
    items: parseBillItems(bill.items),
    totals: parseBillTotals(bill.totals),
  };
}
