import assert from "node:assert/strict";
import test from "node:test";

import { extractLinesFromPage, mapTesseractLines } from "./detect-text.ts";

test("mapTesseractLines sorts by vertical position and trims text", () => {
  const lines = mapTesseractLines([
    {
      text: "  TOTAL 24.50 ",
      confidence: 91,
      bbox: { y0: 220 },
    },
    {
      text: "Dal Bhat Set 12.50",
      confidence: 88,
      bbox: { y0: 40 },
    },
    {
      text: "Momo 8.00",
      confidence: 84,
      bbox: { y0: 90 },
    },
  ]);

  assert.deepEqual(lines, [
    { text: "Dal Bhat Set 12.50", top: 40, confidence: 88 },
    { text: "Momo 8.00", top: 90, confidence: 84 },
    { text: "TOTAL 24.50", top: 220, confidence: 91 },
  ]);
});

test("extractLinesFromPage falls back to plain text lines", () => {
  const lines = extractLinesFromPage({
    blocks: null,
    text: "Burger 9.99\nFries 3.50",
  });

  assert.deepEqual(lines, [
    { text: "Burger 9.99", top: 0, confidence: 0 },
    { text: "Fries 3.50", top: 1, confidence: 0 },
  ]);
});
