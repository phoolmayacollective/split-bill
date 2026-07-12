import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  decryptPaymentDetails,
  encryptPaymentDetails,
  type PaymentDetails,
} from "@/lib/crypto";

const sampleDetails: PaymentDetails = {
  paypal: "ramey@example.com",
  iban: "DE89370400440532013000",
};

describe("encryptPaymentDetails / decryptPaymentDetails", () => {
  it("round-trips payment details with the same password", async () => {
    const password = "test-password-123";
    const encrypted = await encryptPaymentDetails(password, sampleDetails);

    assert.ok(encrypted.payment_enc.length > 0);
    assert.ok(encrypted.payment_iv.length > 0);
    assert.ok(encrypted.payment_salt.length > 0);
    assert.equal(encrypted.kdf_iterations, 100_000);

    const decrypted = await decryptPaymentDetails(
      password,
      encrypted.payment_enc,
      encrypted.payment_iv,
      encrypted.payment_salt,
      encrypted.kdf_iterations,
    );

    assert.deepEqual(decrypted, sampleDetails);
  });

  it("fails decrypt with the wrong password", async () => {
    const encrypted = await encryptPaymentDetails(
      "correct-password",
      sampleDetails,
    );

    await assert.rejects(
      () =>
        decryptPaymentDetails(
          "wrong-password",
          encrypted.payment_enc,
          encrypted.payment_iv,
          encrypted.payment_salt,
          encrypted.kdf_iterations,
        ),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        return true;
      },
    );
  });

  it("supports partial payment details", async () => {
    const password = "paypal-only";
    const details: PaymentDetails = { paypal: "shyamey@example.com" };
    const encrypted = await encryptPaymentDetails(password, details);
    const decrypted = await decryptPaymentDetails(
      password,
      encrypted.payment_enc,
      encrypted.payment_iv,
      encrypted.payment_salt,
      encrypted.kdf_iterations,
    );

    assert.deepEqual(decrypted, details);
  });
});
