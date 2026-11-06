import { defineConfig, devices } from "@playwright/test";

/**
 * Read-only browser checks of the live site, run after a production deployment and on a schedule
 * (.github/workflows/production.yml). The URL is fixed here, never taken from event data.
 * These tests only read pages; they never submit the contact form.
 */
export default defineConfig({
  testDir: "./e2e/prod",
  outputDir: "test-results/prod-artifacts",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  // Network blips get one retry; a repeat failure is a real failure.
  retries: 1,
  workers: 2,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-prod" }], ["github"]],
  use: {
    baseURL: "https://onesmall.company",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "en-US",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
