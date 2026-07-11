import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  matchRosterName,
  normalizeParticipants,
  parseBillParticipants,
} from "./participants";

describe("normalizeParticipants", () => {
  it("trims whitespace and drops empty entries", () => {
    assert.deepEqual(normalizeParticipants([" Alice ", "", "  ", "Bob"]), [
      "Alice",
      "Bob",
    ]);
  });

  it("dedupes case-insensitively keeping first spelling", () => {
    assert.deepEqual(
      normalizeParticipants(["Alice", "alice", "ALICE", "Bob"]),
      ["Alice", "Bob"],
    );
  });
});

describe("matchRosterName", () => {
  const roster = ["Alice", "Bob"];

  it("returns canonical roster spelling for case-insensitive match", () => {
    assert.equal(matchRosterName(roster, "alice"), "Alice");
    assert.equal(matchRosterName(roster, " BOB "), "Bob");
  });

  it("returns null when not on roster", () => {
    assert.equal(matchRosterName(roster, "Carol"), null);
  });
});

describe("parseBillParticipants", () => {
  it("parses json array and normalizes", () => {
    assert.deepEqual(parseBillParticipants([" Alice ", "bob", "Bob"]), [
      "Alice",
      "bob",
    ]);
  });

  it("returns empty array for invalid input", () => {
    assert.deepEqual(parseBillParticipants(null), []);
    assert.deepEqual(parseBillParticipants("Alice"), []);
  });
});
