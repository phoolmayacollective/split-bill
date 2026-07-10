import { createBillSchema } from "@/lib/api/schemas";
import { jsonError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { createBill } from "@/lib/db/bills";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createBillSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const bill = await createBill(parsed.data);
    return jsonResponse({ billId: bill.id }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create bill";
    return jsonError(message, 500);
  }
}
