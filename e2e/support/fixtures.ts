import { test as base, expect, type Page, type TestInfo } from "@playwright/test";

/**
 * Every test fails if the page throws, logs a console error (React hydration errors included) or a
 * first-party request fails, unless the test names that exact problem in `allowedProblems` (one
 * regular expression, so Playwright doesn't read an array as fixture options).
 * There is no global allowlist: the site currently loads without any console error.
 */
type Fixtures = {
  allowedProblems: RegExp | null;
  problems: string[];
  webkitLoopbackHttp: void;
};

export const test = base.extend<Fixtures>({
  allowedProblems: [null, { option: true }],
  /**
   * WebKit upgrades later requests to https://127.0.0.1 after it sees the production
   * Strict-Transport-Security header or the CSP's upgrade-insecure-requests on plain HTTP, which a
   * local test server cannot serve. For WebKit against an http:// server only, the test harness
   * removes those two (HTTPS-only) instructions from responses; everything else in the CSP stays
   * enforced. Chromium and Firefox get the headers unchanged, and the deployed headers are checked
   * by scripts/smoke.mjs.
   */
  webkitLoopbackHttp: [
    async ({ context, browserName, baseURL }, use) => {
      if (browserName === "webkit" && baseURL?.startsWith("http://")) {
        await context.route(`${new URL(baseURL).origin}/**`, async (route) => {
          const response = await route.fetch();
          const headers = { ...response.headers() };
          delete headers["strict-transport-security"];
          if (headers["content-security-policy"]) {
            headers["content-security-policy"] = headers["content-security-policy"]
              .split(";")
              .filter((d) => d.trim() !== "upgrade-insecure-requests")
              .join(";");
          }
          await route.fulfill({ response, headers });
        });
      }
      await use();
    },
    { auto: true },
  ],
  problems: [
    async ({ page, allowedProblems, baseURL }, use, testInfo) => {
      const origin = new URL(baseURL ?? "http://127.0.0.1").origin;
      const found: string[] = [];
      const note = (p: string) => {
        if (!allowedProblems?.test(p)) found.push(p);
      };
      page.on("pageerror", (err) => note(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") note(`console.error: ${msg.text()} @ ${msg.location().url}`);
      });
      page.on("requestfailed", (req) => {
        // Aborts from navigating away mid-load are not failures of the site.
        const failure = req.failure()?.errorText ?? "";
        if (req.url().startsWith(origin) && !/ERR_ABORTED|NS_BINDING_ABORTED|cancelled/i.test(failure)) {
          note(`requestfailed: ${req.method()} ${req.url()} ${failure}`);
        }
      });
      page.on("response", (res) => {
        if (res.url().startsWith(origin) && res.status() >= 400)
          note(`http ${res.status()}: ${res.request().method()} ${res.url()}`);
      });
      await use(found);
      if (found.length) await testInfo.attach("page-problems", { body: found.join("\n"), contentType: "text/plain" });
      expect(found, "unexpected page errors, console errors or failed first-party requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Loads the home page and waits until React has hydrated (the portrait toggle only renders on the client). */
export async function gotoHome(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("group", { name: "Portrait view" })).toBeVisible();
}

/**
 * Identifies one attempt of one test. Retries get a fresh value, so a retry never inherits the
 * first attempt's sent messages or rate-limit slots and reports its own result.
 */
export function runId(testInfo: TestInfo) {
  return `${testInfo.testId}-r${testInfo.retry}`;
}

/** A stable client address per test, so the per-client rate limit never couples tests together. */
export function clientIp(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `198.18.${(h >> 8) & 255}.${h & 255}`;
}
