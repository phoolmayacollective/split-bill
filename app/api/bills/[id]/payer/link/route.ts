import { jsonError, jsonResponse, parseBillId } from "@/lib/api/http";
import { getBillById, updateBill } from "@/lib/db/bills";
import { getPayerSessionFromRequest } from "@/lib/payer-session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = parseBillId(id);

  if (!parsedId.ok) {
    return parsedId.response;
  }

  const session = getPayerSessionFromRequest(request);

  if (!session) {
    return jsonError("Sign in with a username first.", 401);
  }

  try {
    const bill = await getBillById(parsedId.data);

    if (!bill) {
      return jsonError("Bill not found", 404);
    }

    if (bill.payer_id && bill.payer_id !== session.payerId) {
      return jsonError("This bill is linked to another account.", 403);
    }

    if (bill.payer_id === session.payerId) {
      return jsonResponse({ billId: bill.id, linked: true });
    }

    const updated = await updateBill(parsedId.data, {
      payer_id: session.payerId,
    });

    return jsonResponse({ billId: updated.id, linked: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to link bill";
    return jsonError(message, 500);
  }
}
