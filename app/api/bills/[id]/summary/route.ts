import { jsonError, jsonResponse, parseBillId } from "@/lib/api/http";
import { getBillById, normalizeBill } from "@/lib/db/bills";
import { calculateSplits } from "@/lib/split";

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

    const normalized = normalizeBill(bill);
    const owers = calculateSplits({
      items: normalized.items,
      totals: normalized.totals,
      claims: normalized.claims.map((claim) => ({
        ower_name: claim.ower_name,
        item_id: claim.item_id,
        share: Number(claim.share),
      })),
    });

    return jsonResponse({ owers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to compute summary";
    return jsonError(message, 500);
  }
}
