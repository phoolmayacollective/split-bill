import { toPublicBill } from "@/lib/api/bills";
import { jsonError, jsonResponse, parseBillId, parseJsonBody } from "@/lib/api/http";
import { updateBillPaymentSchema } from "@/lib/api/schemas";
import { getBillById, updateBill } from "@/lib/db/bills";

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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = parseBillId(id);

  if (!parsedId.ok) {
    return parsedId.response;
  }

  const parsed = await parseJsonBody(request, updateBillPaymentSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const bill = await getBillById(parsedId.data);

    if (!bill) {
      return jsonError("Bill not found", 404);
    }

    const updated = await updateBill(parsedId.data, parsed.data);
    return jsonResponse({ billId: updated.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update bill";
    return jsonError(message, 500);
  }
}
