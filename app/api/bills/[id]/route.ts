import { toPublicBill } from "@/lib/api/bills";
import { jsonError, jsonResponse, parseBillId } from "@/lib/api/http";
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

    return jsonResponse(toPublicBill(bill));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch bill";
    return jsonError(message, 500);
  }
}
