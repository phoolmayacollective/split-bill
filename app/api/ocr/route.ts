import { jsonError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { ocrParseSchema } from "@/lib/api/schemas";
import { parseReceiptWithGemini } from "@/lib/ocr/parse-receipt-gemini";

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, ocrParseSchema);

  if (!parsed.ok) {
    return parsed.response;
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonError("Receipt parsing is not configured.", 503);
  }

  try {
    const result = await parseReceiptWithGemini(parsed.data.lines);
    return jsonResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse receipt text";
    return jsonError(message, 500);
  }
}
