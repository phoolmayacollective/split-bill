import { z } from "zod";

import type { ParsedReceipt } from "./parse-receipt-text";

const parsedReceiptItemSchema = z.object({
  name: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  qty: z.coerce.number().int().positive(),
});

const parsedReceiptSchema = z.object({
  items: z.array(parsedReceiptItemSchema),
  tax: z.coerce.number().nonnegative().optional(),
  tip: z.coerce.number().nonnegative().optional(),
  total: z.coerce.number().nonnegative().optional(),
});

export function normalizeParsedReceipt(raw: unknown): ParsedReceipt {
  const parsed = parsedReceiptSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error("Receipt parser returned invalid JSON.");
  }

  return {
    items: parsed.data.items.map((item) => ({
      name: item.name,
      price: item.price,
      qty: item.qty,
    })),
    ...(parsed.data.tax !== undefined ? { tax: parsed.data.tax } : {}),
    ...(parsed.data.tip !== undefined ? { tip: parsed.data.tip } : {}),
    ...(parsed.data.total !== undefined ? { total: parsed.data.total } : {}),
  };
}
