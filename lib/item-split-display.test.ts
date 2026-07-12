import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { makeUnitId } from "@/lib/bill-units";
import {
  formatSplitBetweenPeople,
  formatSplitSlotsTaken,
  getLineSplitLabel,
} from "@/lib/item-split-display";

describe("formatSplitBetweenPeople", () => {
  it("describes shared items by people count", () => {
    assert.equal(formatSplitBetweenPeople(3), "Split 3 ways");
  });
});

describe("getLineSplitLabel", () => {
  it("shows open spots while a split is filling up", () => {
    const label = getLineSplitLabel(
      {
        id: makeUnitId("momo", 0),
        parentItemId: "momo",
        unitIndex: 0,
        name: "Momo (10 pc)",
        price: 10,
      },
      { share: 0.3333 },
      [{ ower_name: "Ramey", item_id: makeUnitId("momo", 0), share: 0.3333 }],
    );

    assert.equal(label, `Split 3 ways · ${formatSplitSlotsTaken(1, 3)}`);
  });
});
