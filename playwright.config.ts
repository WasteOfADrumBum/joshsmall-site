import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests against the production build served by `next start` (see e2e/support/serve.mjs).
 * Run `npm run build` first, then `npm run test:e2e`. Email goes to a local Resend stand-in
 * (e2e/support/mock-resend.mjs); no real provider, inbox or secret is involved.
 *
 * Chromium runs everything. Firefox and WebKit run the tests tagged @cross.
 * Hosting behaviour (Vercel redirects, domains, deployed headers) is checked by scripts/smoke.mjs
 * against the real deployment, not here.
 */
const PORT = Number(process.env.E2E_PORT ?? 3100);
const MOCK_PORT = Number(process.env.MOCK_RESEND_PORT ?? 3101);
const CI = !!process.env.CI;
// The weekly workflow sets FULL_MATRIX to run every test in Firefox and WebKit, not just @cross.
const CROSS = process.env.FULL_MATRIX ? undefined : /@cross/;

export const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["prod/**"],
  globalTeardown: "./e2e/support/teardown.ts",
  outputDir: "test-results/artifacts",
  fullyParallel: true,
  forbidOnly: CI,
  // One retry in CI captures a trace for an intermittent failure, and failOnFlakyTests still fails
  // the run, so a flaky test is reported rather than hidden.
  retries: CI ? 1 : 0,
  failOnFlakyTests: CI,
  workers: CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: CI
    ? [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/results.json" }],
        ["github"],
      ]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    // Fixed clock zone and language keep rendered dates and text stable.
    locale: "en-US",
    timezoneId: "America/New_York",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "firefox", grep: CROSS, use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } } },
    // WebKit's HTTPS upgrade of http://127.0.0.1 is handled in e2e/support/fixtures.ts (webkitLoopbackHttp).
    { name: "webkit", grep: CROSS, use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: [
    {
      command: `node e2e/support/mock-resend.mjs`,
      url: `http://127.0.0.1:${MOCK_PORT}/__health`,
      env: { MOCK_RESEND_PORT: String(MOCK_PORT) },
      reuseExistingServer: false,
      timeout: 15_000,
      stdout: "pipe",
    },
    {
      command: `node e2e/support/serve.mjs`,
      url: `${BASE_URL}/`,
      reuseExistingServer: false,
      timeout: 60_000,
      stdout: "pipe",
      gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
      env: {
        E2E_PORT: String(PORT),
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
        // Synthetic values only. RESEND_BASE_URL points the real SDK at the local stand-in.
        RESEND_API_KEY: "re_test_e2e_not_a_secret",
        RESEND_BASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
        CONTACT_TO_EMAIL: "inbox@example.test",
        CONTACT_FROM_EMAIL: "Portfolio Test <contact@example.test>",
      },
    },
  ],
});
