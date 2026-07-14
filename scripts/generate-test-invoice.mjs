/**
 * Generate a generic receipt image for OCR / scan testing.
 * Usage: node scripts/generate-test-invoice.mjs [outputPath]
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const OUT_PATH =
  process.argv[2] ??
  path.join(process.cwd(), "demo/fixtures/generic-invoice.png");

const RECEIPT_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        background: #ddd5c8;
        display: flex;
        justify-content: center;
        padding: 24px;
        font-family: "Courier New", Courier, monospace;
      }
      .receipt {
        width: 320px;
        background: #f7f2e8;
        color: #1a1a1a;
        padding: 28px 22px 32px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
        border: 1px solid #c9bfb0;
      }
      .center { text-align: center; }
      .muted { color: #555; font-size: 11px; }
      .nepali {
        font-size: 11px;
        color: #444;
        margin-top: 2px;
      }
      .rule {
        border: none;
        border-top: 1px dashed #999;
        margin: 14px 0;
      }
      .rule-solid {
        border: none;
        border-top: 1px solid #333;
        margin: 10px 0;
      }
      h1 {
        font-size: 14px;
        letter-spacing: 0.06em;
        margin-bottom: 2px;
      }
      .tagline {
        font-size: 10px;
        color: #7a4a2a;
        letter-spacing: 0.12em;
        margin-bottom: 4px;
      }
      .meta {
        font-size: 11px;
        line-height: 1.5;
        margin-bottom: 2px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
        line-height: 1.7;
      }
      .row .name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row .price {
        flex-shrink: 0;
        text-align: right;
        min-width: 64px;
      }
      .total-row {
        font-weight: 700;
        font-size: 13px;
        margin-top: 4px;
      }
      .footer {
        margin-top: 18px;
        font-size: 10px;
        line-height: 1.5;
        text-align: center;
        color: #666;
      }
    </style>
  </head>
  <body>
    <article class="receipt">
      <div class="center">
        <h1>SAILA DAI KO BHATTI</h1>
        <p class="tagline">JHAMSIKHEL · LALITPUR</p>
        <p class="meta muted">Ward 3, Jhamsikhel Road</p>
        <p class="meta muted">Lalitpur 44700, Nepal</p>
        <p class="meta muted">Tel: +977 1-5550123</p>
        <p class="nepali">सैला दाइको भट्टी</p>
      </div>

      <hr class="rule" />

      <p class="meta">Bill #SDB-2026-0712</p>
      <p class="meta">Date: 12 Jul 2026 &nbsp; 20:15</p>
      <p class="meta">Table: 5 &nbsp; Server: Suman</p>
      <p class="meta">Guests: 4</p>

      <hr class="rule" />

      <div class="row"><span class="name">Chicken Momo (10 pc)</span><span class="price">350.00</span></div>
      <div class="row"><span class="name">Veg Jhol Momo</span><span class="price">320.00</span></div>
      <div class="row"><span class="name">Dal Bhat Thali</span><span class="price">480.00</span></div>
      <div class="row"><span class="name">2 x Masala Chiya</span><span class="price">100.00</span></div>
      <div class="row"><span class="name">Lassi (Mango)</span><span class="price">180.00</span></div>
      <div class="row"><span class="name">Sekuwa Plate</span><span class="price">420.00</span></div>

      <hr class="rule-solid" />

      <div class="row"><span class="name">Subtotal</span><span class="price">1,850.00</span></div>
      <div class="row"><span class="name">Service (10%)</span><span class="price">185.00</span></div>
      <div class="row"><span class="name">VAT (13%)</span><span class="price">264.55</span></div>

      <hr class="rule-solid" />

      <div class="row total-row"><span class="name">TOTAL</span><span class="price">NPR 2,299.55</span></div>

      <p class="footer">
        Dhanyabad! Thank you for visiting.<br />
        PAN: 609123456 · eSewa / Khalti accepted
      </p>
    </article>
  </body>
</html>`;

async function main() {
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  await page.setContent(RECEIPT_HTML, { waitUntil: "networkidle" });
  const receipt = page.locator(".receipt");
  await receipt.screenshot({ path: OUT_PATH, type: "png" });

  await browser.close();
  console.log(`Saved ${OUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
