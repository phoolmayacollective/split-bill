import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BillItem, BillTotals } from "@/lib/database.types";
import { makeUnitId } from "@/lib/bill-units";
import { calculateOwerTotal, calculateSplits } from "@/lib/split";

const momoLine: BillItem = {
  id: "momo",
  name: "Momo (10 pc)",
  price: 10,
  qty: 4,
};
const dalBhat: BillItem = { id: "dal-bhat", name: "Dal Bhat", price: 8, qty: 1 };

const totals: BillTotals = {
  subtotal: 48,
  tax: 4.8,
  tip: 7.2,
  total: 60,
};

describe("calculateSplits", () => {
  it("charges full unit price when claimed alone", () => {
    const results = calculateSplits({
      items: [momoLine],
      totals: { subtotal: 40, tax: 0, tip: 0, total: 40 },
      claims: [
        {
          ower_name: "Ramey",
          item_id: makeUnitId("momo", 0),
          share: 1,
        },
      ],
    });

    assert.equal(results[0].subtotal, 10);
  });

  it("splits one unit when the first claimant chooses 3 people", () => {
    const results = calculateSplits({
      items: [momoLine],
      totals: { subtotal: 40, tax: 0, tip: 0, total: 40 },
      claims: [
        {
          ower_name: "Ramey",
          item_id: makeUnitId("momo", 0),
          share: 0.3333,
        },
      ],
    });

    assert.ok(Math.abs(results[0].subtotal - 3.33) < 0.01);
    assert.match(results[0].lines[0].split_label ?? "", /Split 3 ways/);
  });

  it("splits one unit equally between multiple claimants", () => {
    const unitId = makeUnitId("momo", 1);
    const results = calculateSplits({
      items: [momoLine],
      totals: { subtotal: 40, tax: 0, tip: 0, total: 40 },
      claims: [
        { ower_name: "Ramey", item_id: unitId, share: 0.3333 },
        { ower_name: "Shyamey", item_id: unitId, share: 0.3333 },
        { ower_name: "Suntali", item_id: unitId, share: 0.3333 },
      ],
    });

    for (const result of results) {
      assert.ok(Math.abs(result.subtotal - 3.33) < 0.01);
    }
  });

  it("keeps separate units independent", () => {
    const results = calculateSplits({
      items: [momoLine, dalBhat],
      totals,
      claims: [
        { ower_name: "Ramey", item_id: makeUnitId("momo", 0), share: 1 },
        { ower_name: "Ramey", item_id: makeUnitId("momo", 2), share: 0.5 },
        { ower_name: "Shyamey", item_id: makeUnitId("momo", 2), share: 0.5 },
        { ower_name: "Ramey", item_id: makeUnitId("dal-bhat", 0), share: 1 },
      ],
    });

    const ramey = results.find((result) => result.ower_name === "Ramey");
    const shyamey = results.find((result) => result.ower_name === "Shyamey");

    assert.ok(ramey);
    assert.ok(shyamey);
    assert.equal(ramey.subtotal, 23);
    assert.equal(shyamey.subtotal, 5);
  });
});

describe("calculateOwerTotal", () => {
  it("returns one ower breakdown", () => {
    const result = calculateOwerTotal({
      items: [dalBhat],
      totals: { subtotal: 8, tax: 0, tip: 0, total: 8 },
      ower_name: "Ramey",
      claims: [
        { ower_name: "Ramey", item_id: makeUnitId("dal-bhat", 0), share: 1 },
      ],
    });

    assert.ok(result);
    assert.equal(result.subtotal, 8);
  });
});
