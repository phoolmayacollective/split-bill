import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  expandBillItems,
  makeUnitId,
  normalizeClaimsToUnits,
  shareFromSplitCount,
  splitCountFromShare,
} from "@/lib/bill-units";

describe("expandBillItems", () => {
  it("expands multi-qty items into individual units", () => {
    const units = expandBillItems([
      { id: "momo", name: "Momo (10 pc)", price: 10, qty: 4 },
    ]);

    assert.equal(units.length, 4);
    assert.equal(units[0].id, makeUnitId("momo", 0));
    assert.equal(units[3].id, makeUnitId("momo", 3));
    assert.equal(units[0].price, 10);
  });

  it("creates one unit for single-qty items", () => {
    const units = expandBillItems([
      { id: "dal-bhat", name: "Dal Bhat", price: 8, qty: 1 },
    ]);

    assert.equal(units.length, 1);
    assert.equal(units[0].id, makeUnitId("dal-bhat", 0));
  });
});

describe("normalizeClaimsToUnits", () => {
  it("maps legacy parent-item claims to the first unit", () => {
    const normalized = normalizeClaimsToUnits(
      [{ ower_name: "Ramey", item_id: "momo", share: 1 }],
      [{ id: "momo", name: "Momo (10 pc)", price: 10, qty: 4 }],
    );

    assert.equal(normalized[0].item_id, makeUnitId("momo", 0));
  });
});

describe("shareFromSplitCount", () => {
  it("converts split count to an equal fraction", () => {
    assert.equal(shareFromSplitCount(3), 0.3333);
    assert.equal(shareFromSplitCount(1), 1);
  });
});

describe("splitCountFromShare", () => {
  it("converts fraction back to split count", () => {
    assert.equal(splitCountFromShare(0.3333), 3);
    assert.equal(splitCountFromShare(1), 1);
  });
});
