import assert from "node:assert/strict";
import test from "node:test";

import { parseReceiptLines } from "./parse-receipt-text.ts";

test("parseReceiptLines extracts line items, tax, and tip", () => {
  const result = parseReceiptLines([
    "Dal Bhat Set       12.50",
    "Momo (6pc)          8.00",
    "2 x Lassi           6.00",
    "Tax: 1.65",
    "Tip 3.00",
    "TOTAL 31.15",
  ]);

  assert.equal(result.items.length, 3);
  assert.deepEqual(result.items[0], {
    name: "Dal Bhat Set",
    price: 12.5,
    qty: 1,
  });
  assert.deepEqual(result.items[2], {
    name: "Lassi",
    price: 6,
    qty: 2,
  });
  assert.equal(result.tax, 1.65);
  assert.equal(result.tip, 3);
});

test("parseReceiptLines ignores headers and totals", () => {
  const result = parseReceiptLines([
    "Receipt",
    "Table 4",
    "Burger 9.99",
    "Subtotal 9.99",
    "Amount due 9.99",
  ]);

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0]?.name, "Burger");
});
