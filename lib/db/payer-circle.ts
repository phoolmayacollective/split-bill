import type {
  PayerCircleInsert,
  PayerCircleRow,
} from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase";

export type CircleMember = {
  payerId: string;
  username: string;
  addedAt: string;
};

export async function listCircleMembers(
  ownerPayerId: string,
): Promise<CircleMember[]> {
  const supabase = createServerSupabaseClient();

  const { data: rows, error } = await supabase
    .from("payer_circle")
    .select("member_payer_id, created_at")
    .eq("owner_payer_id", ownerPayerId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list circle: ${error.message}`);
  }

  if (!rows?.length) {
    return [];
  }

  const memberIds = rows.map((row) => row.member_payer_id);
  const { data: payers, error: payersError } = await supabase
    .from("payers")
    .select("id, username")
    .in("id", memberIds);

  if (payersError) {
    throw new Error(`Failed to fetch circle members: ${payersError.message}`);
  }

  const usernameById = new Map(
    (payers ?? []).map((payer) => [payer.id, payer.username]),
  );

  return rows.flatMap((row) => {
    const username = usernameById.get(row.member_payer_id);
    if (!username) {
      return [];
    }

    return [
      {
        payerId: row.member_payer_id,
        username,
        addedAt: row.created_at,
      },
    ];
  });
}

export async function addCircleMember(input: {
  ownerPayerId: string;
  memberPayerId: string;
}): Promise<PayerCircleRow> {
  const supabase = createServerSupabaseClient();

  const payload: PayerCircleInsert = {
    owner_payer_id: input.ownerPayerId,
    member_payer_id: input.memberPayerId,
  };

  const { data, error } = await supabase
    .from("payer_circle")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add circle member: ${error.message}`);
  }

  return data;
}

export async function removeCircleMember(input: {
  ownerPayerId: string;
  memberPayerId: string;
}): Promise<boolean> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("payer_circle")
    .delete()
    .eq("owner_payer_id", input.ownerPayerId)
    .eq("member_payer_id", input.memberPayerId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to remove circle member: ${error.message}`);
  }

  return Boolean(data);
}
