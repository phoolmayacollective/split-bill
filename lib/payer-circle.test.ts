import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  circleAddErrorMessage,
  validateCircleAdd,
} from "@/lib/payer-circle";

describe("validateCircleAdd", () => {
  it("rejects invalid usernames", () => {
    assert.equal(
      validateCircleAdd({
        ownerUsername: "alex",
        memberUsername: "a",
        existingMemberUsernames: [],
      }),
      "invalid_username",
    );
  });

  it("rejects adding yourself", () => {
    assert.equal(
      validateCircleAdd({
        ownerUsername: "alex",
        memberUsername: "Alex",
        existingMemberUsernames: [],
      }),
      "self_add",
    );
  });

  it("rejects duplicate members case-insensitively", () => {
    assert.equal(
      validateCircleAdd({
        ownerUsername: "alex",
        memberUsername: "BOB",
        existingMemberUsernames: ["bob"],
      }),
      "duplicate",
    );
  });

  it("accepts a new valid member", () => {
    assert.equal(
      validateCircleAdd({
        ownerUsername: "alex",
        memberUsername: "bob",
        existingMemberUsernames: ["charlie"],
      }),
      null,
    );
  });
});

describe("circleAddErrorMessage", () => {
  it("returns user-facing copy for each code", () => {
    assert.match(circleAddErrorMessage("invalid_username"), /2–32/);
    assert.match(circleAddErrorMessage("self_add"), /yourself/);
    assert.match(circleAddErrorMessage("duplicate"), /already/);
  });
});
