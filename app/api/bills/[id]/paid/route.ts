import { jsonError, jsonResponse, parseBillId, parseJsonBody } from "@/lib/api/http";
import { requirePayerPassword } from "@/lib/api/payer-auth";
import { markOwerPaidSchema } from "@/lib/api/schemas";
import {
  getBillOwerSummaries,
  owerHasClaims,
} from "@/lib/api/summary";
import { getBillById } from "@/lib/db/bills";
import { markOwerPaid } from "@/lib/db/ower-payments";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = parseBillId(id);

  if (!parsedId.ok) {
    return parsedId.response;
  }

  const parsedBody = await parseJsonBody(request, markOwerPaidSchema);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  try {
    const bill = await getBillById(parsedId.data);

    if (!bill) {
      return jsonError("Bill not found", 404);
    }

    const auth = requirePayerPassword(request, bill);
    if (!auth.ok) {
      return auth.response;
    }

    if (!owerHasClaims(bill, parsedBody.data.ower_name)) {
      return jsonError("No claims found for this name on the bill.", 400);
    }

    await markOwerPaid(parsedId.data, parsedBody.data.ower_name);
    const owers = await getBillOwerSummaries(bill);
    const ower = owers.find(
      (entry) => entry.ower_name === parsedBody.data.ower_name.trim(),
    );

    if (!ower) {
      return jsonError("Failed to load updated summary.", 500);
    }

    return jsonResponse({ ower });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark as paid";
    return jsonError(message, 500);
  }
}
