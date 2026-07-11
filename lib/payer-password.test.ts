import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashPayerViewPassword } from "@/lib/payer-password";
import { verifyPayerPasswordHash } from "@/lib/payer-password-server";

const billId = "550e8400-e29b-41d4-a716-446655440000";

describe("hashPayerViewPassword", () => {
  it("returns a stable hash for the same password and bill", async () => {
    const first = await hashPayerViewPassword("my-secret-password", billId);
    const second = await hashPayerViewPassword("my-secret-password", billId);

    assert.equal(first, second);
    assert.ok(first.length > 0);
  });

  it("returns different hashes for different passwords", async () => {
    const first = await hashPayerViewPassword("password-a", billId);
    const second = await hashPayerViewPassword("password-b", billId);

    assert.notEqual(first, second);
  });

  it("returns different hashes for different bills", async () => {
    const first = await hashPayerViewPassword(
      "same-password",
      "550e8400-e29b-41d4-a716-446655440001",
    );
    const second = await hashPayerViewPassword(
      "same-password",
      "550e8400-e29b-41d4-a716-446655440002",
    );

    assert.notEqual(first, second);
  });
});

describe("verifyPayerPasswordHash", () => {
  it("allows access when no payer password is set", () => {
    assert.equal(verifyPayerPasswordHash("anything", { payer_password_hash: null }), true);
  });

  it("rejects missing hash when password is required", () => {
    assert.equal(
      verifyPayerPasswordHash(null, { payer_password_hash: "abc123" }),
      false,
    );
  });

  it("accepts a matching hash", async () => {
    const password = "payer-dashboard-password";
    const hash = await hashPayerViewPassword(password, billId);

    assert.equal(
      verifyPayerPasswordHash(hash, { payer_password_hash: hash }),
      true,
    );
  });

  it("rejects a non-matching hash", async () => {
    const hash = await hashPayerViewPassword("correct-password", billId);

    assert.equal(
      verifyPayerPasswordHash("wrong-hash", { payer_password_hash: hash }),
      false,
    );
  });
});
