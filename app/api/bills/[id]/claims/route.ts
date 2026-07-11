import { toPublicBill } from "@/lib/api/bills";
import { createClaimsSchema } from "@/lib/api/schemas";
import { validateClaimQuantities } from "@/lib/claim-units";
import { jsonError, jsonResponse, parseBillId, parseJsonBody } from "@/lib/api/http";
import {
  getBillById,
  normalizeBill,
  replaceOwerClaims,
} from "@/lib/db/bills";

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

    const quantities = Object.fromEntries(
      parsedBody.data.claims.map((claim) => [claim.item_id, claim.share]),
    );
    const validationError = validateClaimQuantities(
      normalized.items,
      normalized.claims.map((claim) => ({
        ower_name: claim.ower_name,
        item_id: claim.item_id,
        share: Number(claim.share),
      })),
      parsedBody.data.ower_name,
      quantities,
    );

    if (validationError) {
      return jsonError(validationError, 400);
    }

    await replaceOwerClaims(
      parsedId.data,
      parsedBody.data.ower_name,
      parsedBody.data.claims.map((claim) => ({
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
