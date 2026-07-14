import assert from "node:assert/strict";
import test from "node:test";

import { normalizeParsedReceipt } from "./normalize-parsed-receipt.ts";

test("normalizeParsedReceipt accepts valid Gemini-shaped JSON", () => {
  const result = normalizeParsedReceipt({
    items: [
      { name: "Dal Bhat Set", price: 12.5, qty: 1 },
      { name: "Lassi", price: "6", qty: "2" },
    ],
    tax: "1.65",
    tip: 0,
  });

  assert.equal(result.items.length, 2);
  assert.deepEqual(result.items[1], {
    name: "Lassi",
    price: 6,
    qty: 2,
  });
  assert.equal(result.tax, 1.65);
  assert.equal(result.tip, 0);
});

test("normalizeParsedReceipt passes through the receipt total", () => {
  const result = normalizeParsedReceipt({
    items: [{ name: "Dal Bhat Set", price: 12.5, qty: 1 }],
    total: "24.50",
  });

  assert.equal(result.total, 24.5);
});

test("normalizeParsedReceipt omits total when absent", () => {
  const result = normalizeParsedReceipt({
    items: [{ name: "Dal Bhat Set", price: 12.5, qty: 1 }],
  });

  assert.equal("total" in result, false);
});

test("normalizeParsedReceipt rejects invalid items", () => {
  assert.throws(
    () =>
      normalizeParsedReceipt({
        items: [{ name: "", price: 5, qty: 1 }],
      }),
    /invalid JSON/i,
  );
});
