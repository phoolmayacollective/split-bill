import { jsonError, jsonResponse } from "@/lib/api/http";
import { requirePayerSession } from "@/lib/api/require-payer-session";

export async function GET(request: Request) {
  const auth = requirePayerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  return jsonResponse({
    payer: {
      id: auth.session.payerId,
      username: auth.session.username,
    },
  });
}
