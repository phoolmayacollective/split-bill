import assert from "node:assert/strict";
import test from "node:test";

import { createRateLimiter, getClientKey } from "./rate-limit.ts";

test("createRateLimiter allows requests under the limit", () => {
  const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

  assert.equal(limiter.check("a", 1_000), true);
  assert.equal(limiter.check("a", 2_000), true);
  assert.equal(limiter.check("a", 3_000), true);
});

test("createRateLimiter blocks requests over the limit", () => {
  const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });

  assert.equal(limiter.check("a", 1_000), true);
  assert.equal(limiter.check("a", 2_000), true);
  assert.equal(limiter.check("a", 3_000), false);
});

test("createRateLimiter resets after the window passes", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 10_000 });

  assert.equal(limiter.check("a", 1_000), true);
  assert.equal(limiter.check("a", 2_000), false);
  assert.equal(limiter.check("a", 12_000), true);
});

test("createRateLimiter tracks keys independently", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });

  assert.equal(limiter.check("a", 1_000), true);
  assert.equal(limiter.check("b", 1_000), true);
  assert.equal(limiter.check("a", 2_000), false);
});

test("getClientKey prefers the first forwarded address", () => {
  const request = new Request("http://localhost/api/ocr", {
    headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
  });

  assert.equal(getClientKey(request), "203.0.113.7");
});

test("getClientKey falls back to x-real-ip then unknown", () => {
  const withRealIp = new Request("http://localhost/api/ocr", {
    headers: { "x-real-ip": "198.51.100.3" },
  });
  const bare = new Request("http://localhost/api/ocr");

  assert.equal(getClientKey(withRealIp), "198.51.100.3");
  assert.equal(getClientKey(bare), "unknown");
});
