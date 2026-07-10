import { toPublicBill } from "@/lib/api/bills";
import { createClaimsSchema } from "@/lib/api/schemas";
import { jsonError, jsonResponse, parseBillId, parseJsonBody } from "@/lib/api/http";
import { addClaims, getBillById, normalizeBill } from "@/lib/db/bills";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const parsedId = parseBillId(id);

  if (!parsedId.ok) {
    return parsedId.response;
  }

  const parsedBody = await parseJsonBody(request, createClaimsSchema);

  if (!parsedBody.ok) {
    return parsedBody.response;
  }

  try {
    const bill = await getBillById(parsedId.data);

    if (!bill) {
      return jsonError("Bill not found", 404);
    }

    const normalized = normalizeBill(bill);
    const itemIds = new Set(normalized.items.map((item) => item.id));
    const invalidItemIds = parsedBody.data.claims
      .map((claim) => claim.item_id)
      .filter((itemId) => !itemIds.has(itemId));

    if (invalidItemIds.length > 0) {
      return jsonError("One or more item ids do not exist on this bill", 400, {
        item_ids: [...new Set(invalidItemIds)],
      });
    }

    await addClaims(
      parsedId.data,
      parsedBody.data.claims.map((claim) => ({
        ower_name: parsedBody.data.ower_name,
        item_id: claim.item_id,
        share: claim.share,
      })),
    );

    const updatedBill = await getBillById(parsedId.data);

    if (!updatedBill) {
      return jsonError("Bill not found", 404);
    }

    return jsonResponse(
      {
        ower_name: parsedBody.data.ower_name,
        bill: toPublicBill(updatedBill),
      },
      201,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add claims";
    return jsonError(message, 500);
  }
}
