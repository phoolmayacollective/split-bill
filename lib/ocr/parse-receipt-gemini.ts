import { GoogleGenAI, Type } from "@google/genai";

import { normalizeParsedReceipt } from "./normalize-parsed-receipt";
import type { ParsedReceipt } from "./parse-receipt-text";

const DEFAULT_MODEL = "gemini-flash-latest";

const RECEIPT_PARSE_PROMPT = `Extract line items from this OCR receipt text.
Ignore headers, subtotals, totals, payment info, dates, and store names.
Fix obvious OCR typos in item names when confident.
Return only purchasable line items with name, price, and quantity.`;

export async function parseReceiptWithGemini(
  lines: string[],
): Promise<ParsedReceipt> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? DEFAULT_MODEL,
    contents: `${RECEIPT_PARSE_PROMPT}

OCR text:
${lines.join("\n")}`,
    config: {
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                qty: { type: Type.INTEGER },
              },
              required: ["name", "price", "qty"],
            },
          },
          tax: { type: Type.NUMBER },
          tip: { type: Type.NUMBER },
        },
        required: ["items"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response.");
  }

  return normalizeParsedReceipt(JSON.parse(text));
}
