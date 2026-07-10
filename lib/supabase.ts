import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
    );
  }

  return { url, serviceRoleKey };
}

/** Server-side Supabase client with service role. Use only in API routes / server code. */
export function createServerSupabaseClient() {
  const { url, serviceRoleKey } = getSupabaseConfig();

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
