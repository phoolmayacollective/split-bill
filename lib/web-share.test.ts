import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildSharePayload,
  isShareableLink,
  normalizeShareUrl,
} from "./web-share";

describe("isShareableLink", () => {
  it("accepts http and https URLs", () => {
    assert.equal(isShareableLink("https://example.com/bill/abc"), true);
    assert.equal(isShareableLink("http://localhost:3000/bill/abc"), true);
  });

  it("accepts paypal.me links without protocol", () => {
    assert.equal(isShareableLink("paypal.me/ramey"), true);
  });

  it("rejects plain emails and handles", () => {
    assert.equal(isShareableLink("you@example.com"), false);
    assert.equal(isShareableLink("@username"), false);
  });
});

describe("normalizeShareUrl", () => {
  it("keeps absolute URLs unchanged", () => {
    assert.equal(
      normalizeShareUrl("https://example.com/bill/abc#secret"),
      "https://example.com/bill/abc#secret",
    );
  });

  it("adds https to paypal.me links", () => {
    assert.equal(normalizeShareUrl("paypal.me/ramey"), "https://paypal.me/ramey");
  });
});

describe("buildSharePayload", () => {
  it("builds url payloads for links", () => {
    assert.deepEqual(
      buildSharePayload("https://example.com/bill/abc", {
        mode: "url",
        title: "Share link",
      }),
      { title: "Share link", url: "https://example.com/bill/abc" },
    );
  });

  it("builds text payloads for non-link values", () => {
    assert.deepEqual(
      buildSharePayload("hunter2", { mode: "text", title: "Bill password" }),
      { title: "Bill password", text: "hunter2" },
    );
  });
});
