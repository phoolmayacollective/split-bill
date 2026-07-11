import { createServerSupabaseClient } from "@/lib/supabase";

export type OwerPaymentRow = {
  bill_id: string;
  ower_name: string;
  paid_at: string;
};

export async function getOwerPayments(billId: string): Promise<OwerPaymentRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("ower_payments")
    .select("bill_id, ower_name, paid_at")
    .eq("bill_id", billId);

  if (error) {
    throw new Error(`Failed to fetch ower payments: ${error.message}`);
  }

  return data ?? [];
}

export async function markOwerPaid(
  billId: string,
  owerName: string,
): Promise<OwerPaymentRow> {
  const supabase = createServerSupabaseClient();
  const trimmedName = owerName.trim();

  const { data, error } = await supabase
    .from("ower_payments")
    .upsert(
      {
        bill_id: billId,
        ower_name: trimmedName,
        paid_at: new Date().toISOString(),
      },
      { onConflict: "bill_id,ower_name" },
    )
    .select("bill_id, ower_name, paid_at")
    .single();

  if (error) {
    throw new Error(`Failed to mark ower as paid: ${error.message}`);
  }

  return data;
}
