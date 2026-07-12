import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterDalbhatMenu } from "./dalbhat-menu-search";

describe("filterDalbhatMenu", () => {
  it("finds dalbhat items with fuzzy out-of-order letters", () => {
    const result = filterDalbhatMenu("dlbt", "all");

    assert.equal(result.hasResults, true);
    assert.ok(result.dalbhat.length > 0);
    assert.ok(
      result.dalbhat.some((item) =>
        item.name_en.toLowerCase().includes("dalbhat"),
      ),
    );
  });

  it("finds momo with partial letters", () => {
    const result = filterDalbhatMenu("mm", "all");

    assert.equal(result.showMomo, true);
  });
});
