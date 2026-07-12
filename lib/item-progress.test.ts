import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BillItem } from "@/lib/database.types";
import { makeUnitId } from "@/lib/bill-units";
import { calculateItemProgress } from "@/lib/item-progress";

const pizza: BillItem = { id: "pizza", name: "Pizza", price: 10, qty: 4 };

describe("calculateItemProgress", () => {
  it("tracks each unit separately", () => {
    const results = calculateItemProgress({
      items: [pizza],
      claims: [
        {
          ower_name: "Alice",
          item_id: makeUnitId("pizza", 0),
          share: 0.3333,
        },
      ],
      paidOwerNames: new Set(),
    });

    assert.equal(results.length, 4);
    assert.equal(results[0].percent_claimed, 33);
    assert.equal(results[0].percent_paid, 0);
    assert.equal(results[0].status, "pending");
    assert.equal(results[1].status, "unclaimed");
  });

  it("shows paid progress as a fraction of the unit", () => {
    const unitId = makeUnitId("pizza", 0);
    const results = calculateItemProgress({
      items: [pizza],
      claims: [
        { ower_name: "Alice", item_id: unitId, share: 0.3333 },
        { ower_name: "Bob", item_id: unitId, share: 0.3333 },
        { ower_name: "Carol", item_id: unitId, share: 0.3333 },
      ],
      paidOwerNames: new Set(["Alice"]),
    });

    assert.equal(results[0].percent_claimed, 100);
    assert.equal(results[0].percent_paid, 33);
    assert.equal(results[0].status, "pending");
  });

  it("marks a unit settled when fully claimed and paid", () => {
    const unitId = makeUnitId("pizza", 1);
    const results = calculateItemProgress({
      items: [pizza],
      claims: [{ ower_name: "Alice", item_id: unitId, share: 1 }],
      paidOwerNames: new Set(["Alice"]),
    });

    assert.equal(results[1].percent_claimed, 100);
    assert.equal(results[1].percent_paid, 100);
    assert.equal(results[1].status, "settled");
  });
});
