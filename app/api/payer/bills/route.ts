import { getPayerBillSummaries } from "@/lib/api/payer-bills";
import { jsonError, jsonResponse } from "@/lib/api/http";
import { requirePayerSession } from "@/lib/api/require-payer-session";

export async function GET(request: Request) {
  const auth = requirePayerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const bills = await getPayerBillSummaries(auth.session.payerId);

    return jsonResponse({
      payer: {
        id: auth.session.payerId,
        username: auth.session.username,
      },
      bills,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list bills";
    return jsonError(message, 500);
  }
}
