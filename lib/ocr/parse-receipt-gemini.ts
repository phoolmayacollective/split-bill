import { GoogleGenAI, Type } from "@google/genai";

import { normalizeParsedReceipt } from "./normalize-parsed-receipt";
import type { ParsedReceipt } from "./parse-receipt-text";

const DEFAULT_MODEL = "gemini-flash-latest";

const RECEIPT_PARSE_PROMPT = `Extract line items from this OCR receipt text.
Ignore headers, subtotals, payment info, dates, and store names.
Fix obvious OCR typos in item names when confident.
Return only purchasable line items with name, price, and quantity.

Rules:
- "price" is the PER-UNIT price. If a line shows a quantity and a line total
  (e.g. "2 x Bier 9,00" where 9,00 is the total), divide the total by the
  quantity to get the unit price.
- When a line has TWO amounts after the item name, the first is usually the
  unit price and the second is the line total — use the first as "price" and
  ignore the second. Example: "2x pizza 8$ 16$" → name "pizza", qty 2,
  price 8 (not 16). Same pattern with € or comma decimals: "2x Bier 4,50 9,00".
- Include deposit lines (e.g. Pfand) as regular items.
- If a discount clearly applies to a specific item, reduce that item's unit
  price instead of adding a discount line. Ignore discounts you cannot
  attribute to an item.
- "total" is the final printed grand total on the receipt (the amount paid),
  if one is present.
- Amounts may use comma decimal separators (e.g. 12,50 means 12.50).
- Ignore timestamps and dates — do not treat them as prices or line items.
  Examples to skip: "14:32", "14.07.2026", "07/14/26", "2026-07-14".
  A lone number on a date/time line is not a cost.
- OCR often misreads the euro sign (€) as the digit 6. If a price looks like
  "612,50" or "69,00" but the receipt context suggests euros, treat the
  leading 6 as € and parse 12,50 or 9,00 instead. Only apply when confident
  the 6 is a currency symbol, not a real digit in the amount.`;

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
      temperature: 0.1,
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
          total: { type: Type.NUMBER },
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
