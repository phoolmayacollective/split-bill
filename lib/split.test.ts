import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { BillItem, BillTotals } from "@/lib/database.types";
import { calculateOwerTotal, calculateSplits } from "@/lib/split";

const items: BillItem[] = [
  { id: "pizza", name: "Pizza", price: 20, qty: 1 },
  { id: "salad", name: "Salad", price: 10, qty: 1 },
  { id: "drink", name: "Drink", price: 5, qty: 2 },
];

const totals: BillTotals = {
  subtotal: 40,
  tax: 4,
  tip: 6,
  total: 50,
};

describe("calculateSplits", () => {
  it("single ower claims all items owes full claimed subtotal + tax + tip", () => {
    const results = calculateSplits({
      items,
      totals,
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Alice", item_id: "salad", share: 1 },
        { ower_name: "Alice", item_id: "drink", share: 2 },
      ],
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].ower_name, "Alice");
    assert.equal(results[0].subtotal, 40);
    assert.equal(results[0].tax_share, 4);
    assert.equal(results[0].tip_share, 6);
    assert.equal(results[0].total, 50);
  });

  it("two owers split one item equally", () => {
    const results = calculateSplits({
      items: [{ id: "pizza", name: "Pizza", price: 20, qty: 1 }],
      totals: { subtotal: 20, tax: 2, tip: 0, total: 22 },
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Bob", item_id: "pizza", share: 1 },
      ],
    });

    const alice = results.find((r) => r.ower_name === "Alice");
    const bob = results.find((r) => r.ower_name === "Bob");

    assert.ok(alice);
    assert.ok(bob);
    assert.equal(alice.subtotal, 10);
    assert.equal(bob.subtotal, 10);
    assert.equal(alice.tax_share, 1);
    assert.equal(bob.tax_share, 1);
    assert.equal(alice.total, 11);
    assert.equal(bob.total, 11);
  });

  it("allocates tax and tip proportionally by subtotal", () => {
    const results = calculateSplits({
      items,
      totals,
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Bob", item_id: "salad", share: 1 },
        { ower_name: "Bob", item_id: "drink", share: 1 },
      ],
    });

    const alice = results.find((r) => r.ower_name === "Alice");
    const bob = results.find((r) => r.ower_name === "Bob");

    assert.ok(alice);
    assert.ok(bob);
    assert.equal(alice.subtotal, 20);
    assert.equal(bob.subtotal, 15);
    assert.equal(alice.tax_share, 2);
    assert.equal(bob.tax_share, 1.5);
    assert.equal(alice.tip_share, 3);
    assert.equal(bob.tip_share, 2.25);
    assert.equal(alice.total, 25);
    assert.equal(bob.total, 18.75);
  });

  it("charges unit price times quantity claimed when item qty > 1", () => {
    const results = calculateSplits({
      items: [{ id: "beer", name: "Beer", price: 5, qty: 4 }],
      totals: { subtotal: 20, tax: 0, tip: 0, total: 20 },
      claims: [{ ower_name: "Alice", item_id: "beer", share: 2 }],
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].subtotal, 10);
    assert.equal(results[0].lines[0].item_name, "Beer");
    assert.equal(results[0].lines[0].split_label, "2 of 4");
  });

  it("labels shared single-qty items as split between people", () => {
    const results = calculateSplits({
      items: [{ id: "pizza", name: "Pizza", price: 20, qty: 1 }],
      totals: { subtotal: 20, tax: 0, tip: 0, total: 20 },
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 1 },
        { ower_name: "Bob", item_id: "pizza", share: 1 },
        { ower_name: "Carol", item_id: "pizza", share: 1 },
        { ower_name: "Dan", item_id: "pizza", share: 1 },
      ],
    });

    for (const result of results) {
      assert.equal(result.lines[0].split_label, "Split between 4 people");
    }
  });

  it("splits multi-qty items among multiple owers by units", () => {
    const results = calculateSplits({
      items: [{ id: "beer", name: "Beer", price: 5, qty: 4 }],
      totals: { subtotal: 20, tax: 0, tip: 0, total: 20 },
      claims: [
        { ower_name: "Alice", item_id: "beer", share: 2 },
        { ower_name: "Bob", item_id: "beer", share: 2 },
      ],
    });

    const alice = results.find((result) => result.ower_name === "Alice");
    const bob = results.find((result) => result.ower_name === "Bob");

    assert.ok(alice);
    assert.ok(bob);
    assert.equal(alice.subtotal, 10);
    assert.equal(bob.subtotal, 10);
  });

  it("supports weighted shares on the same item", () => {
    const results = calculateSplits({
      items: [{ id: "pizza", name: "Pizza", price: 30, qty: 1 }],
      totals: { subtotal: 30, tax: 0, tip: 0, total: 30 },
      claims: [
        { ower_name: "Alice", item_id: "pizza", share: 2 },
        { ower_name: "Bob", item_id: "pizza", share: 1 },
      ],
    });

    const alice = results.find((r) => r.ower_name === "Alice");
    const bob = results.find((r) => r.ower_name === "Bob");

    assert.ok(alice);
    assert.ok(bob);
    assert.equal(alice.subtotal, 20);
    assert.equal(bob.subtotal, 10);
  });

  it("ignores unclaimed items", () => {
    const results = calculateSplits({
      items,
      totals,
      claims: [{ ower_name: "Alice", item_id: "salad", share: 1 }],
    });

    assert.equal(results.length, 1);
    assert.equal(results[0].subtotal, 10);
    assert.equal(results[0].tax_share, 1);
    assert.equal(results[0].tip_share, 1.5);
    assert.equal(results[0].total, 12.5);
  });
});

describe("calculateOwerTotal", () => {
  it("returns one ower breakdown", () => {
    const result = calculateOwerTotal({
      items,
      totals,
      ower_name: "Alice",
      claims: [{ ower_name: "Alice", item_id: "pizza", share: 1 }],
    });

    assert.ok(result);
    assert.equal(result.ower_name, "Alice");
    assert.equal(result.subtotal, 20);
    assert.equal(result.tax_share, 2);
    assert.equal(result.tip_share, 3);
  });
});
