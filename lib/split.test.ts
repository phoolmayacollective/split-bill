import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BillItem, BillTotals } from "@/lib/database.types";
import { makeUnitId } from "@/lib/bill-units";
import { calculateOwerTotal, calculateSplits } from "@/lib/split";

const pizzaLine: BillItem = { id: "pizza", name: "Pizza", price: 10, qty: 4 };
const salad: BillItem = { id: "salad", name: "Salad", price: 8, qty: 1 };

const totals: BillTotals = {
  subtotal: 48,
  tax: 4.8,
  tip: 7.2,
  total: 60,
};

describe("calculateSplits", () => {
  it("charges full unit price when claimed alone", () => {
    const results = calculateSplits({
      items: [pizzaLine],
      totals: { subtotal: 40, tax: 0, tip: 0, total: 40 },
      claims: [
        {
          ower_name: "Alice",
          item_id: makeUnitId("pizza", 0),
          share: 1,
        },
      ],
    });

    assert.equal(results[0].subtotal, 10);
  });

  it("splits one unit when the first claimant chooses 3 people", () => {
    const results = calculateSplits({
      items: [pizzaLine],
      totals: { subtotal: 40, tax: 0, tip: 0, total: 40 },
      claims: [
        {
          ower_name: "Alice",
          item_id: makeUnitId("pizza", 0),
          share: 0.3333,
        },
      ],
    });

    assert.ok(Math.abs(results[0].subtotal - 3.33) < 0.01);
    assert.match(results[0].lines[0].split_label ?? "", /Split 3 ways/);
  });

  it("splits one unit equally between multiple claimants", () => {
    const unitId = makeUnitId("pizza", 1);
    const results = calculateSplits({
      items: [pizzaLine],
      totals: { subtotal: 40, tax: 0, tip: 0, total: 40 },
      claims: [
        { ower_name: "Alice", item_id: unitId, share: 0.3333 },
        { ower_name: "Bob", item_id: unitId, share: 0.3333 },
        { ower_name: "Carol", item_id: unitId, share: 0.3333 },
      ],
    });

    for (const result of results) {
      assert.ok(Math.abs(result.subtotal - 3.33) < 0.01);
    }
  });

  it("keeps separate units independent", () => {
    const results = calculateSplits({
      items: [pizzaLine, salad],
      totals,
      claims: [
        { ower_name: "Alice", item_id: makeUnitId("pizza", 0), share: 1 },
        { ower_name: "Alice", item_id: makeUnitId("pizza", 2), share: 0.5 },
        { ower_name: "Bob", item_id: makeUnitId("pizza", 2), share: 0.5 },
        { ower_name: "Alice", item_id: makeUnitId("salad", 0), share: 1 },
      ],
    });

    const alice = results.find((result) => result.ower_name === "Alice");
    const bob = results.find((result) => result.ower_name === "Bob");

    assert.ok(alice);
    assert.ok(bob);
    assert.equal(alice.subtotal, 23);
    assert.equal(bob.subtotal, 5);
  });
});

describe("calculateOwerTotal", () => {
  it("returns one ower breakdown", () => {
    const result = calculateOwerTotal({
      items: [salad],
      totals: { subtotal: 8, tax: 0, tip: 0, total: 8 },
      ower_name: "Alice",
      claims: [
        { ower_name: "Alice", item_id: makeUnitId("salad", 0), share: 1 },
      ],
    });

    assert.ok(result);
    assert.equal(result.subtotal, 8);
  });
});
