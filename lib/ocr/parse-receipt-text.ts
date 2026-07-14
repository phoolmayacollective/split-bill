export type ParsedReceiptItem = {
  name: string;
  price: number;
  qty: number;
};

export type ParsedReceipt = {
  items: ParsedReceiptItem[];
  tax?: number;
  tip?: number;
  /** Printed grand total on the receipt, used to sanity-check parsed items. */
  total?: number;
};

const SKIP_LINE =
  /^(total|subtotal|change|cash|card|visa|mastercard|amount due|balance|thank you|receipt|date|time|server|table|guests?)\b/i;

const TAX_LINE = /^tax\b[:\s]*([\d.,]+)/i;
const TIP_LINE = /^tip\b[:\s]*([\d.,]+)/i;
const QTY_PRICE_LINE =
  /^(\d+)\s*x\s+(.+?)\s+([\d.,]+)\s*$/i;
const NAME_PRICE_LINE = /^(.+?)\s+([\d.,]+)\s*$/;

export function parseReceiptLines(lines: string[]): ParsedReceipt {
  const items: ParsedReceiptItem[] = [];
  let tax: number | undefined;
  let tip: number | undefined;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || SKIP_LINE.test(line)) {
      continue;
    }

    const taxMatch = line.match(TAX_LINE);
    if (taxMatch) {
      tax = parseMoney(taxMatch[1]);
      continue;
    }

    const tipMatch = line.match(TIP_LINE);
    if (tipMatch) {
      tip = parseMoney(tipMatch[1]);
      continue;
    }

    const qtyMatch = line.match(QTY_PRICE_LINE);
    if (qtyMatch) {
      const qty = Number.parseInt(qtyMatch[1], 10);
      const name = qtyMatch[2].trim();
      const price = parseMoney(qtyMatch[3]);
      if (name && price > 0 && qty > 0) {
        items.push({ name, price, qty });
      }
      continue;
    }

    const priceMatch = line.match(NAME_PRICE_LINE);
    if (!priceMatch) {
      continue;
    }

    const name = priceMatch[1].trim();
    const price = parseMoney(priceMatch[2]);
    if (name && price > 0) {
      items.push({ name, price, qty: 1 });
    }
  }

  return { items, tax, tip };
}

export function parseMoney(value: string): number {
  const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}
