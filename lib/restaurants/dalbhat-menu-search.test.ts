import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { filterDalbhatMenu } from "./dalbhat-menu-search";
import { fuzzyScore } from "../fuzzy-search";

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

  it("sorts matching items by relevance when searching", () => {
    const result = filterDalbhatMenu("dalbhat", "dalbhat");
    const scoreItem = (item: { name_en: string; name_de: string }) =>
      Math.max(
        fuzzyScore(item.name_en, "dalbhat"),
        fuzzyScore(item.name_de, "dalbhat"),
      );

    assert.ok(result.dalbhat.length >= 2);
    for (let index = 1; index < result.dalbhat.length; index += 1) {
      assert.ok(
        scoreItem(result.dalbhat[index - 1]) >= scoreItem(result.dalbhat[index]),
      );
    }
  });
});
