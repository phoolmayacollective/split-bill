import assert from "node:assert/strict";
import test from "node:test";

import { reconcileTotals } from "./reconcile-total.ts";

test("reconcileTotals returns null when totals match within tolerance", () => {
  assert.equal(reconcileTotals(24.5, 24.5), null);
  assert.equal(reconcileTotals(24.5, 24.53), null);
  assert.equal(reconcileTotals(24.53, 24.5), null);
});

test("reconcileTotals reports a mismatch beyond tolerance", () => {
  const mismatch = reconcileTotals(42.3, 45.8);

  assert.ok(mismatch);
  assert.equal(mismatch.computedTotal, 42.3);
  assert.equal(mismatch.receiptTotal, 45.8);
  assert.ok(Math.abs(mismatch.difference - 3.5) < 1e-9);
});

test("reconcileTotals returns null when no receipt total was parsed", () => {
  assert.equal(reconcileTotals(42.3, undefined), null);
  assert.equal(reconcileTotals(42.3, 0), null);
});

test("reconcileTotals returns null when no items were parsed", () => {
  assert.equal(reconcileTotals(0, 45.8), null);
});

test("reconcileTotals honors a custom tolerance", () => {
  assert.equal(reconcileTotals(42, 43, 1), null);
  assert.ok(reconcileTotals(42, 43.5, 1));
});
