import { expect, test } from "@playwright/test";

import {
  clearOwerSession,
  DEMO_PERSONAS,
  demoClick,
  demoGoto,
  demoType,
  loadAudioManifest,
  pauseForScene,
  setupDemoVisuals,
  withDemoPersona,
} from "./demo-helpers";

test("full app walkthrough", async ({ browser }) => {
  const audioManifest = await loadAudioManifest();

  const context = await browser.newContext({
    recordVideo: {
      dir: "demo/output/videos",
      size: { width: 390, height: 844 },
    },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await setupDemoVisuals(context);
  const page = await context.newPage();

  // Scene 1 — Landing
  await demoGoto(page, withDemoPersona("/", DEMO_PERSONAS.overview));
  await expect(page.getByRole("heading", { name: "Split Bill" })).toBeVisible();
  await expect(page.getByTestId("demo-persona-banner")).toHaveText(
    /Demo · Product demo/,
  );
  await pauseForScene(page, "landing", audioManifest);

  // Scene 2 — Payer creates bill (items, tax/tip, roster)
  await demoClick(page, page.getByRole("link", { name: "Create a bill" }));
  await page.waitForURL("**/create/manual**");
  await demoGoto(page, withDemoPersona(page.url(), DEMO_PERSONAS.payer));
  await expect(page.getByTestId("demo-persona-banner")).toHaveText(
    /Demo · Payer · Alex/,
  );

  await demoType(page, page.getByLabel("Name").first(), "Margherita pizza");
  await demoType(page, page.getByLabel("Price").first(), "18");
  await demoType(page, page.getByLabel("Tax"), "2");
  await demoType(page, page.getByLabel("Tip"), "3");
  await demoType(page, page.getByPlaceholder("e.g. Alex"), "Sam");
  await demoClick(page, page.getByRole("button", { name: "Add", exact: true }));
  await demoType(page, page.getByPlaceholder("e.g. Alex"), "Jordan");
  await demoClick(page, page.getByRole("button", { name: "Add", exact: true }));
  await pauseForScene(page, "create", audioManifest);

  await demoClick(page, page.getByRole("button", { name: "Continue to payment" }));
  await page.waitForURL("**/create/*/payment**");

  // Scene 3 — Payment
  await demoGoto(page, withDemoPersona(page.url(), DEMO_PERSONAS.payer));
  await demoType(page, page.getByLabel("PayPal"), "alex@example.com");
  await pauseForScene(page, "payment", audioManifest);

  await demoClick(page, page.getByRole("button", { name: "Save & open dashboard" }));
  await page.waitForURL("**/bill/*/payer**");

  const payerUrl = page.url();
  const billMatch = payerUrl.match(/\/bill\/([^/]+)\/payer/);
  expect(billMatch).not.toBeNull();
  const billId = billMatch![1];
  const passwordMatch = payerUrl.match(/#(.+)$/);
  expect(passwordMatch).not.toBeNull();
  const password = decodeURIComponent(passwordMatch![1]);

  // Scene 4 — Payer dashboard (initial)
  await demoGoto(page, withDemoPersona(payerUrl, DEMO_PERSONAS.payer));
  await pauseForScene(page, "payer_dashboard", audioManifest);

  const sharePath = `/bill/${billId}/name#${encodeURIComponent(password)}`;

  // Scene 5 — Copy share link
  const shareCopyButton = page
    .getByLabel("Share link")
    .locator("xpath=../button[contains(., 'Copy')]");
  await demoClick(page, shareCopyButton);
  await pauseForScene(page, "share_link", audioManifest);

  // Scene 6 — Ower Sam picks name
  await demoGoto(page, withDemoPersona(sharePath, DEMO_PERSONAS.ower));
  await expect(page.getByTestId("demo-persona-banner")).toHaveText(
    /Demo · Ower · Sam/,
  );
  await demoClick(page, page.getByRole("button", { name: "Sam" }));
  await pauseForScene(page, "ower_name", audioManifest);
  await demoClick(page, page.getByRole("button", { name: "Continue" }));
  await page.waitForURL(`**/bill/${billId}/items**`);

  // Scene 7 — Sam claims item and splits with 2 people
  await demoGoto(page, withDemoPersona(page.url(), DEMO_PERSONAS.ower));
  const claimCheckbox = page.getByRole("checkbox").first();
  await demoClick(page, claimCheckbox);
  await expect(claimCheckbox).toBeChecked();
  await demoClick(page, page.getByRole("button", { name: "More people" }));
  await pauseForScene(page, "ower_items", audioManifest);

  const samClaimsResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/bills/${billId}/claims`) &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await demoClick(
    page,
    page.getByRole("button", { name: /Continue|View summary/ }),
  );
  await samClaimsResponse;
  await page.waitForURL(`**/bill/${billId}/summary**`);

  // Scene 8 — Sam sees decrypted payment details and copies PayPal
  await demoGoto(page, withDemoPersona(page.url(), DEMO_PERSONAS.ower));
  await expect(page.getByText("alex@example.com")).toBeVisible({
    timeout: 20_000,
  });
  await demoClick(page, page.getByRole("button", { name: "Copy PayPal" }));
  await pauseForScene(page, "ower_payment", audioManifest);

  // Scene 9 — Jordan joins the split
  await clearOwerSession(page, billId);
  await demoGoto(page, withDemoPersona(sharePath, DEMO_PERSONAS.owerJordan));
  await expect(page.getByTestId("demo-persona-banner")).toHaveText(
    /Demo · Ower · Jordan/,
  );
  await demoClick(page, page.getByRole("button", { name: "Jordan" }));
  await demoClick(page, page.getByRole("button", { name: "Continue" }));
  await page.waitForURL(`**/bill/${billId}/items**`);
  await demoGoto(page, withDemoPersona(page.url(), DEMO_PERSONAS.owerJordan));

  const jordanCheckbox = page.getByRole("checkbox").first();
  await expect(page.getByText(/Split 2 ways · 1 of 2 spots claimed/)).toBeVisible();
  await demoClick(page, jordanCheckbox);
  await expect(jordanCheckbox).toBeChecked();
  await expect(page.getByText(/Your share ·/)).toBeVisible();
  await pauseForScene(page, "ower_jordan", audioManifest);

  const jordanClaimsResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/bills/${billId}/claims`) &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await demoClick(
    page,
    page.getByRole("button", { name: /Continue|View summary/ }),
  );
  await jordanClaimsResponse;
  await page.waitForURL(`**/bill/${billId}/summary**`);

  // Scene 10 — Payer sees per-item progress and marks Sam paid
  await expect(async () => {
    await demoGoto(page, withDemoPersona(payerUrl, DEMO_PERSONAS.payer));
    await expect(
      page.getByRole("progressbar", { name: /Margherita pizza/ }),
    ).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("0/2 people paid")).toBeVisible();
  }).toPass({ timeout: 30_000 });

  await page
    .getByRole("progressbar", { name: /Margherita pizza/ })
    .scrollIntoViewIfNeeded();
  await pauseForScene(page, "payer_progress", audioManifest);

  const samRow = page
    .locator("li")
    .filter({ hasText: "Sam" })
    .filter({ has: page.getByRole("button", { name: "Mark paid" }) });
  await demoClick(page, samRow.getByRole("button", { name: "Mark paid" }));
  const markSamPaidResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/bills/${billId}/paid`) &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await demoClick(page, page.getByRole("button", { name: "Confirm" }));
  await markSamPaidResponse;

  // Scene 11 — Jordan self-reports payment
  const jordanSummaryPath = `/bill/${billId}/summary#${encodeURIComponent(password)}`;
  await demoGoto(
    page,
    withDemoPersona(jordanSummaryPath, DEMO_PERSONAS.owerJordan),
  );
  await expect(page.getByRole("button", { name: "I've paid" })).toBeVisible({
    timeout: 20_000,
  });
  await pauseForScene(page, "ower_jordan_paid", audioManifest);

  const jordanPaidResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/bills/${billId}/paid`) &&
      response.request().method() === "POST" &&
      response.ok(),
  );
  await demoClick(page, page.getByRole("button", { name: "I've paid" }));
  await jordanPaidResponse;
  await expect(page.getByText("Marked as paid")).toBeVisible();

  // Scene 12 — Payer sees full collection
  await expect(async () => {
    await demoGoto(page, withDemoPersona(payerUrl, DEMO_PERSONAS.payer));
    await expect(page.getByText("2/2 people paid")).toBeVisible({
      timeout: 5_000,
    });
  }).toPass({ timeout: 30_000 });

  await pauseForScene(page, "payer_update", audioManifest);

  // Scene 13 — Dal Bhat restaurant menu
  await demoGoto(
    page,
    withDemoPersona("/restaurant/dalbhat", DEMO_PERSONAS.restaurant),
  );
  await expect(page.getByRole("heading", { name: /Dal Bhat/i })).toBeVisible();
  await demoType(page, page.getByLabel("Search menu"), "momo");
  await demoClick(
    page,
    page.getByRole("button", { name: "Increase quantity" }).first(),
  );
  await expect(page.getByText(/items ·/)).toBeVisible();
  await pauseForScene(page, "dalbhat", audioManifest);

  await context.close();
});
