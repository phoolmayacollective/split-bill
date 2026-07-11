import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hashAccountPassword,
  isValidPayerUsername,
  normalizePayerUsername,
  verifyAccountPassword,
} from "@/lib/payer-account";
import { createSessionToken, parseSessionToken } from "@/lib/payer-session";

describe("normalizePayerUsername", () => {
  it("lowercases and trims", () => {
    assert.equal(normalizePayerUsername("  Alex  "), "alex");
  });
});

describe("isValidPayerUsername", () => {
  it("accepts simple usernames", () => {
    assert.equal(isValidPayerUsername("alex"), true);
    assert.equal(isValidPayerUsername("user_1"), true);
  });

  it("rejects invalid usernames", () => {
    assert.equal(isValidPayerUsername("a"), false);
    assert.equal(isValidPayerUsername("bad name"), false);
    assert.equal(isValidPayerUsername("bad-name"), false);
  });
});

describe("account password hashing", () => {
  it("verifies a stored password hash", async () => {
    const stored = await hashAccountPassword("friends-only");
    assert.equal(await verifyAccountPassword("friends-only", stored), true);
    assert.equal(await verifyAccountPassword("wrong", stored), false);
  });
});

describe("payer session token", () => {
  it("round-trips a session payload", () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const token = createSessionToken({
      payerId: "550e8400-e29b-41d4-a716-446655440000",
      username: "alex",
    });

    const session = parseSessionToken(token);
    assert.deepEqual(session, {
      payerId: "550e8400-e29b-41d4-a716-446655440000",
      username: "alex",
    });
  });

  it("rejects tampered tokens", () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const token = createSessionToken({
      payerId: "550e8400-e29b-41d4-a716-446655440000",
      username: "alex",
    });

    assert.equal(parseSessionToken(`${token}x`), null);
  });
});
