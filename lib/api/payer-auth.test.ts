import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isBillOwnedByPayerSession,
  requirePayerPassword,
} from "@/lib/api/payer-auth";
import { hashPayerViewPassword } from "@/lib/payer-password";
import {
  createSessionToken,
  PAYER_SESSION_COOKIE,
} from "@/lib/payer-session";
import type { BillWithClaims } from "@/lib/database.types";

const billId = "550e8400-e29b-41d4-a716-446655440000";
const payerId = "660e8400-e29b-41d4-a716-446655440001";

function billWithPassword(
  overrides: Partial<BillWithClaims> = {},
): BillWithClaims {
  return {
    id: billId,
    items: [],
    totals: { subtotal: 0, tax: 0, tip: 0, total: 0 },
    participants: [],
    payment_enc: null,
    payment_iv: null,
    payment_salt: null,
    kdf_iterations: null,
    payer_password_hash: "stored-hash",
    payer_id: payerId,
    created_at: "2026-01-01T00:00:00.000Z",
    claims: [],
    ...overrides,
  };
}

function requestWithSession(
  token: string,
  headers: Record<string, string> = {},
): Request {
  return new Request("http://localhost/api/bills/test/payer", {
    headers: {
      Cookie: `${PAYER_SESSION_COOKIE}=${token}`,
      ...headers,
    },
  });
}

describe("isBillOwnedByPayerSession", () => {
  it("returns true when the signed-in payer owns the bill", () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const token = createSessionToken({ payerId, username: "alex" });
    const request = requestWithSession(token);

    assert.equal(
      isBillOwnedByPayerSession(request, { payer_id: payerId }),
      true,
    );
  });

  it("returns false for a different payer or missing session", () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const token = createSessionToken({ payerId, username: "alex" });
    const request = requestWithSession(token);

    assert.equal(
      isBillOwnedByPayerSession(request, {
        payer_id: "770e8400-e29b-41d4-a716-446655440002",
      }),
      false,
    );
    assert.equal(
      isBillOwnedByPayerSession(new Request("http://localhost"), {
        payer_id: payerId,
      }),
      false,
    );
  });
});

describe("requirePayerPassword", () => {
  it("allows bill owners without the bill password hash", () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const token = createSessionToken({ payerId, username: "alex" });
    const request = requestWithSession(token);
    const result = requirePayerPassword(request, billWithPassword());

    assert.equal(result.ok, true);
  });

  it("still requires the bill password for non-owners", () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const request = new Request("http://localhost/api/bills/test/payer");
    const result = requirePayerPassword(request, billWithPassword());

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.response.status, 401);
    }
  });

  it("accepts a matching bill password hash for non-owners", async () => {
    const password = "share-password";
    const hash = await hashPayerViewPassword(password, billId);
    const request = new Request("http://localhost/api/bills/test/payer", {
      headers: { "X-Bill-Password-Hash": hash },
    });

    const result = requirePayerPassword(
      request,
      billWithPassword({ payer_password_hash: hash }),
    );

    assert.equal(result.ok, true);
  });

  it("ignores unrelated payer sessions when the bill is unlinked", async () => {
    process.env.SESSION_SECRET = "test-session-secret-for-unit-tests";

    const token = createSessionToken({ payerId, username: "alex" });
    const request = requestWithSession(token);
    const result = requirePayerPassword(
      request,
      billWithPassword({ payer_id: null }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.response.status, 401);
    }
  });
});
