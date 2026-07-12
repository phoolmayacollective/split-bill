import type { PayerInsert, PayerRow } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function getPayerById(id: string): Promise<PayerRow | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("payers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch payer: ${error.message}`);
  }

  return data;
}

export async function getPayerByUsername(
  username: string,
): Promise<PayerRow | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("payers")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch payer: ${error.message}`);
  }

  return data;
}

export async function createPayer(input: {
  username: string;
  passwordHash: string;
}): Promise<PayerRow> {
  const supabase = createServerSupabaseClient();

  const payload: PayerInsert = {
    username: input.username,
    password_hash: input.passwordHash,
  };

  const { data, error } = await supabase
    .from("payers")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payer: ${error.message}`);
  }

  return data;
}
