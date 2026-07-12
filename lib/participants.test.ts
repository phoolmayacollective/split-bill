import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  matchRosterName,
  normalizeParticipants,
  parseBillParticipants,
} from "./participants";

describe("normalizeParticipants", () => {
  it("trims whitespace and drops empty entries", () => {
    assert.deepEqual(normalizeParticipants([" Ramey ", "", "  ", "Shyamey"]), [
      "Ramey",
      "Shyamey",
    ]);
  });

  it("dedupes case-insensitively keeping first spelling", () => {
    assert.deepEqual(
      normalizeParticipants(["Ramey", "ramey", "RAMEY", "Shyamey"]),
      ["Ramey", "Shyamey"],
    );
  });
});

describe("matchRosterName", () => {
  const roster = ["Ramey", "Shyamey"];

  it("returns canonical roster spelling for case-insensitive match", () => {
    assert.equal(matchRosterName(roster, "ramey"), "Ramey");
    assert.equal(matchRosterName(roster, " SHYAMEY "), "Shyamey");
  });

  it("returns null when not on roster", () => {
    assert.equal(matchRosterName(roster, "Suntali"), null);
  });
});

describe("parseBillParticipants", () => {
  it("parses json array and normalizes", () => {
    assert.deepEqual(parseBillParticipants([" Ramey ", "shyamey", "Shyamey"]), [
      "Ramey",
      "shyamey",
    ]);
  });

  it("returns empty array for invalid input", () => {
    assert.deepEqual(parseBillParticipants(null), []);
    assert.deepEqual(parseBillParticipants("Ramey"), []);
  });
});
