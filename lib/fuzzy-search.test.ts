import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fuzzyMatch, matchesFuzzySearch } from "./fuzzy-search";

describe("fuzzyMatch", () => {
  it("matches an empty query against any text", () => {
    assert.deepEqual(fuzzyMatch("Dal Bhat", ""), { match: true, indices: [] });
    assert.deepEqual(fuzzyMatch("Dal Bhat", "   "), { match: true, indices: [] });
  });

  it("matches contiguous substrings", () => {
    const result = fuzzyMatch("Steamed Momo", "momo");
    assert.equal(result.match, true);
    assert.deepEqual(result.indices, [4, 9, 10, 11]);
  });

  it("matches characters in order with gaps", () => {
    const result = fuzzyMatch("Dal Bhat & Paprika", "dbp");
    assert.equal(result.match, true);
    assert.deepEqual(result.indices, [0, 4, 11]);
  });

  it("is case insensitive", () => {
    assert.equal(fuzzyMatch("Chicken Momo", "MOMO").match, true);
    assert.equal(fuzzyMatch("Chicken Momo", "chkn").match, true);
  });

  it("rejects queries with missing characters", () => {
    assert.equal(fuzzyMatch("Dal Bhat", "dalx").match, false);
    assert.equal(fuzzyMatch("Momo", "momos").match, false);
  });
});

describe("matchesFuzzySearch", () => {
  it("finds menu items by partial out-of-order letters", () => {
    assert.equal(
      matchesFuzzySearch("Dalbhat & Paprika (Chicken & Paprika)", "dlbt"),
      true,
    );
    assert.equal(matchesFuzzySearch("Steamed Momo", "std"), true);
  });
});
