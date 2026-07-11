import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BillItem } from "@/lib/database.types";
import { calculateItemProgress } from "@/lib/item-progress";

const pizza: BillItem = { id: "pizza", name: "Pizza", price: 30, qty: 1 };
const beer: BillItem = { id: "beer", name: "Beer", price: 5, qty: 4 };

describe("calculateItemProgress", () => {
  it("marks unclaimed items as 0% with unclaimed status", () => {
    const results = calculateItemProgress({
      items: [pizza],
      claims: [],
      paidOwerNames: new Set(),
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].percent_paid, 0);
    assert.equal(results[0].status, "unclaimed");
    assert.equal(results[0].claimants.length, 0);
  });

  it("shows 33% when one of three equal sharers has paid", () => {
    const results = calculateItemProgress({
      items: [pizza],
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Bob", item_id: "pizza", share: 1 },
        { ower_name: "Carol", item_id: "pizza", share: 1 },
      ],
      paidOwerNames: new Set(["Alice"]),
    });

    assert.equal(results[0].percent_paid, 33);
    assert.equal(results[0].status, "pending");
    assert.equal(results[0].paid_share, 1);
    assert.equal(results[0].claimed_share, 3);
  });

  it("marks item settled when every claimant has paid", () => {
    const results = calculateItemProgress({
      items: [pizza],
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Bob", item_id: "pizza", share: 1 },
      ],
      paidOwerNames: new Set(["Alice", "Bob"]),
    });

    assert.equal(results[0].percent_paid, 100);
    assert.equal(results[0].status, "settled");
  });

  it("tracks multi-qty items by claimed units", () => {
    const results = calculateItemProgress({
      items: [beer],
      claims: [
        { ower_name: "Alice", item_id: "beer", share: 2 },
        { ower_name: "Bob", item_id: "beer", share: 2 },
      ],
      paidOwerNames: new Set(["Alice"]),
    });

    assert.equal(results[0].percent_paid, 50);
    assert.equal(results[0].claimed_share, 4);
    assert.equal(results[0].paid_share, 2);
  });
});
