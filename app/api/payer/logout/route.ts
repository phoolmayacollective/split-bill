import { jsonResponse } from "@/lib/api/http";
import { buildClearSessionCookie } from "@/lib/payer-session";

export async function POST() {
  return jsonResponse({ ok: true }, 200, {
    "Set-Cookie": buildClearSessionCookie(),
  });
}
