import { jsonError, jsonResponse, parseJsonBody } from "@/lib/api/http";
import { createRateLimiter, getClientKey } from "@/lib/api/rate-limit";
import { ocrParseSchema } from "@/lib/api/schemas";
import { parseReceiptWithGemini } from "@/lib/ocr/parse-receipt-gemini";

const rateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request: Request) {
  if (!rateLimiter.check(getClientKey(request))) {
    return jsonError("Too many scans. Wait a moment and try again.", 429);
  }

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
