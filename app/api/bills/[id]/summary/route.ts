import { jsonError, jsonResponse, parseBillId } from "@/lib/api/http";
import { getBillOwerSummaries } from "@/lib/api/summary";
import { getBillById } from "@/lib/db/bills";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = parseBillId(id);

  if (!parsedId.ok) {
    return parsedId.response;
  }

  try {
    const bill = await getBillById(parsedId.data);

    if (!bill) {
      return jsonError("Bill not found", 404);
    }

    const owers = await getBillOwerSummaries(bill);

    return jsonResponse({ owers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to compute summary";
    return jsonError(message, 500);
  }
}
