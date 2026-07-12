import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { makeUnitId } from "@/lib/bill-units";
import {
  draftToQuantities,
  getUnitPoolInfo,
  validateClaimDraft,
} from "@/lib/claim-units";
import type { BillItem } from "@/lib/database.types";

const pizza: BillItem = { id: "pizza", name: "Pizza", price: 10, qty: 4 };

describe("draftToQuantities", () => {
  it("stores an equal fraction per enabled unit", () => {
    const quantities = draftToQuantities({
      [makeUnitId("pizza", 0)]: { enabled: true, splitCount: 3 },
    });

    assert.equal(quantities[makeUnitId("pizza", 0)], 0.3333);
  });
});

describe("getUnitPoolInfo", () => {
  it("reports remaining slots for a partial split", () => {
    const info = getUnitPoolInfo(
      makeUnitId("pizza", 0),
      [{ ower_name: "Alice", item_id: makeUnitId("pizza", 0), share: 0.3333 }],
      "Bob",
    );

    assert.equal(info.splitCount, 3);
    assert.equal(info.claimantCount, 1);
    assert.equal(info.slotsRemaining, 2);
    assert.equal(info.canJoin, true);
    assert.equal(info.isFull, false);
  });
});

describe("validateClaimDraft", () => {
  it("allows joining an existing split with the same count", () => {
    const error = validateClaimDraft(
      [pizza],
      [{ ower_name: "Alice", item_id: makeUnitId("pizza", 0), share: 0.3333 }],
      "Bob",
      {
        [makeUnitId("pizza", 0)]: { enabled: true, splitCount: 3 },
      },
    );

    assert.equal(error, null);
  });

  it("rejects a different split count on the same unit", () => {
    const error = validateClaimDraft(
      [pizza],
      [{ ower_name: "Alice", item_id: makeUnitId("pizza", 0), share: 0.3333 }],
      "Bob",
      {
        [makeUnitId("pizza", 0)]: { enabled: true, splitCount: 2 },
      },
    );

    assert.match(error ?? "", /already split 3 ways/);
  });
});
