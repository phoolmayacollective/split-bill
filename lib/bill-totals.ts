import type { BillItem, BillTotals } from "@/lib/database.types";

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function itemLineTotal(item: BillItem): number {
  return roundMoney(item.price * item.qty);
}

export function calculateSubtotal(items: BillItem[]): number {
  return roundMoney(
    items.reduce((sum, item) => sum + itemLineTotal(item), 0),
  );
}

export function calculateTotal(
  subtotal: number,
  tax: number,
  tip: number,
): number {
  return roundMoney(subtotal + tax + tip);
}

export function buildTotals(
  items: BillItem[],
  tax: number,
  tip: number,
): BillTotals {
  const subtotal = calculateSubtotal(items);
  return {
    subtotal,
    tax: roundMoney(tax),
    tip: roundMoney(tip),
    total: calculateTotal(subtotal, tax, tip),
  };
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
