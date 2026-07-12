import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BillItem } from "@/lib/database.types";
import { makeUnitId } from "@/lib/bill-units";
import { calculateItemProgress } from "@/lib/item-progress";

const momo: BillItem = { id: "momo", name: "Momo (10 pc)", price: 10, qty: 4 };

describe("calculateItemProgress", () => {
  it("tracks each unit separately", () => {
    const results = calculateItemProgress({
      items: [momo],
      claims: [
        {
          ower_name: "Ramey",
          item_id: makeUnitId("momo", 0),
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
    const unitId = makeUnitId("momo", 0);
    const results = calculateItemProgress({
      items: [momo],
      claims: [
        { ower_name: "Ramey", item_id: unitId, share: 0.3333 },
        { ower_name: "Shyamey", item_id: unitId, share: 0.3333 },
        { ower_name: "Suntali", item_id: unitId, share: 0.3333 },
      ],
      paidOwerNames: new Set(["Ramey"]),
    });

    assert.equal(results[0].percent_claimed, 100);
    assert.equal(results[0].percent_paid, 33);
    assert.equal(results[0].status, "pending");
  });

  it("marks a unit settled when fully claimed and paid", () => {
    const unitId = makeUnitId("momo", 1);
    const results = calculateItemProgress({
      items: [momo],
      claims: [{ ower_name: "Ramey", item_id: unitId, share: 1 }],
      paidOwerNames: new Set(["Ramey"]),
    });

    assert.equal(results[1].percent_claimed, 100);
    assert.equal(results[1].percent_paid, 100);
    assert.equal(results[1].status, "settled");
  });
});
