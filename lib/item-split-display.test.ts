import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatSplitBetweenPeople,
  formatUnitClaimLabel,
  getItemClaimantCount,
  getLineSplitLabel,
} from "@/lib/item-split-display";

describe("formatSplitBetweenPeople", () => {
  it("returns null for one or fewer people", () => {
    assert.equal(formatSplitBetweenPeople(0), null);
    assert.equal(formatSplitBetweenPeople(1), null);
  });

  it("describes shared items by people count", () => {
    assert.equal(formatSplitBetweenPeople(4), "Split between 4 people");
  });
});

describe("formatUnitClaimLabel", () => {
  it("describes claimed units out of total", () => {
    assert.equal(formatUnitClaimLabel(2, 4), "2 of 4");
    assert.equal(formatUnitClaimLabel(1, 4), "1 of 4");
  });

  it("returns null for single-unit items", () => {
    assert.equal(formatUnitClaimLabel(1, 1), null);
  });
});

describe("getItemClaimantCount", () => {
  it("counts distinct claimants on an item", () => {
    const count = getItemClaimantCount("pizza", [
      { ower_name: "Alice", item_id: "pizza", share: 1 },
      { ower_name: "Bob", item_id: "pizza", share: 1 },
      { ower_name: "Alice", item_id: "salad", share: 1 },
    ]);

    assert.equal(count, 2);
  });
});

describe("getLineSplitLabel", () => {
  it("prefers unit counts for multi-qty items", () => {
    const label = getLineSplitLabel(
      { id: "beer", qty: 4 },
      { share: 2 },
      [
        { ower_name: "Alice", item_id: "beer", share: 2 },
        { ower_name: "Bob", item_id: "beer", share: 2 },
      ],
    );

    assert.equal(label, "2 of 4");
  });

  it("uses people framing for shared single items", () => {
    const label = getLineSplitLabel(
      { id: "pizza", qty: 1 },
      { share: 1 },
      [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Bob", item_id: "pizza", share: 1 },
      ],
    );

    assert.equal(label, "Split between 2 people");
  });
});
