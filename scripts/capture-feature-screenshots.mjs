/**
 * Capture feature page screenshots from the live production app.
 * Usage: node scripts/capture-feature-screenshots.mjs [baseURL]
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const PRODUCTION_URL = "https://split-bill-gamma-three.vercel.app";
const BASE_URL = process.argv[2] ?? PRODUCTION_URL;
const OUT_DIR = path.join(process.cwd(), "public/features");

function assertProductionTarget(url) {
  const host = new URL(url).hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    throw new Error(
      `Refusing to capture from dev server (${url}). Pass an explicit baseURL if you really need localhost.`,
    );
  }
}

async function assertNoDevOverlay(page) {
  const devIndicators = await page.evaluate(() => ({
    nextPortal: document.querySelectorAll("nextjs-portal").length,
    buildWatcher: document.querySelectorAll("#__next-build-watcher").length,
  }));

  if (devIndicators.nextPortal > 0 || devIndicators.buildWatcher > 0) {
    throw new Error(
      "Next.js dev overlay detected — screenshots must be captured from production, not localhost.",
    );
  }
}

async function screenshot(page, name) {
  await assertNoDevOverlay(page);
  const filePath = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Saved ${filePath}`);
}

async function main() {
  assertProductionTarget(BASE_URL);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    extraHTTPHeaders: { "x-vercel-skip-toolbar": "1" },
  });

  console.log(`Capturing from ${BASE_URL}`);

  // Landing
  await page.goto(`${BASE_URL}/`);
  await page.getByRole("heading", { name: "Split Bill" }).waitFor();
  await screenshot(page, "landing");

  // Create bill — items step
  await page.getByRole("link", { name: "Create a bill" }).click();
  await page.waitForURL("**/create/manual**");
  await page.getByLabel("Name").first().fill("Momo (10 pc)");
  await page.getByLabel("Price").first().fill("16");
  await page.getByLabel("Tax").fill("2");
  await page.getByLabel("Tip").fill("3");
  await page.getByPlaceholder("e.g. Alex").fill("Shyamey");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByPlaceholder("e.g. Alex").fill("Harkey");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await screenshot(page, "create-bill");

  // Payment step
  await page.getByRole("button", { name: "Continue to payment" }).click();
  await page.waitForURL("**/create/*/payment**");
  await page.getByLabel("PayPal").fill("ramey@example.com");
  await screenshot(page, "payment");

  // Payer dashboard + share
  await page.getByRole("button", { name: "Save & open dashboard" }).click();
  await page.waitForURL("**/bill/*/payer**");
  const payerUrl = page.url();
  const billMatch = payerUrl.match(/\/bill\/([^/]+)\/payer/);
  if (!billMatch) throw new Error("Could not parse bill id from payer URL");
  const billId = billMatch[1];
  const passwordMatch = payerUrl.match(/#(.+)$/);
  if (!passwordMatch) throw new Error("Could not parse password from payer URL");
  const password = decodeURIComponent(passwordMatch[1]);
  await page.getByText("Share with friends").scrollIntoViewIfNeeded();
  await screenshot(page, "share");

  const sharePath = `/bill/${billId}/name#${encodeURIComponent(password)}`;

  // Ower — pick name and claim items
  await page.goto(`${BASE_URL}${sharePath}`);
  await page.getByRole("button", { name: "Shyamey" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL(`**/bill/${billId}/items**`);
  await page.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: "More people" }).click();
  await screenshot(page, "ower-claim");

  await page.getByRole("button", { name: /Continue|View summary/ }).click();
  await page.waitForURL(`**/bill/${billId}/summary**`);
  await page.getByText("ramey@example.com").waitFor({ timeout: 20_000 });
  await screenshot(page, "ower-summary");

  // Payer dashboard with progress (Harkey joins in background for fuller view)
  await page.evaluate(
    (id) => sessionStorage.removeItem(`split-bill:ower:${id}`),
    billId,
  );
  await page.goto(`${BASE_URL}${sharePath}`);
  await page.getByRole("button", { name: "Harkey" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForURL(`**/bill/${billId}/items**`);
  await page.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: /Continue|View summary/ }).click();
  await page.waitForURL(`**/bill/${billId}/summary**`);

  await page.goto(payerUrl);
  await page.getByRole("progressbar").first().waitFor({ timeout: 30_000 });
  await page.getByRole("progressbar").first().scrollIntoViewIfNeeded();
  await screenshot(page, "payer-dashboard");

  // Dal Bhat restaurant menu
  await page.goto(`${BASE_URL}/restaurant/dalbhat`);
  await page.getByRole("heading", { name: /Dal Bhat/i }).waitFor();
  await page.getByLabel("Search menu").fill("momo");
  await page.getByRole("button", { name: "Increase quantity" }).first().click();
  await screenshot(page, "dalbhat");

  await browser.close();
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
