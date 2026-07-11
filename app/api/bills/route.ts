import { createBillSchema } from "@/lib/api/schemas";
import { jsonError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { createBill } from "@/lib/db/bills";
import { getPayerSessionFromRequest } from "@/lib/payer-session";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createBillSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const session = getPayerSessionFromRequest(request);
    const bill = await createBill({
      ...parsed.data,
      payerId: session?.payerId ?? null,
    });
    return jsonResponse({ billId: bill.id }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create bill";
    return jsonError(message, 500);
  }
}
