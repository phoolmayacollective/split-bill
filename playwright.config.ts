import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 600_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3001",
    viewport: { width: 390, height: 844 },
    video: {
      mode: "on",
      size: { width: 390, height: 844 },
    },
  },
  outputDir: "demo/output/test-results",
});
