import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every test fails if the page throws, logs a console error (React hydration errors included) or a
 * first-party request fails, unless the test names that exact problem in `allowedProblems` (one
 * regular expression, so Playwright doesn't read an array as fixture options).
 * There is no global allowlist: the site currently loads without any console error.
 */
type Fixtures = {
  allowedProblems: RegExp | null;
  problems: string[];
};

export const test = base.extend<Fixtures>({
  allowedProblems: [null, { option: true }],
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

/** A stable client address per test, so the per-client rate limit never couples tests together. */
export function clientIp(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `198.18.${(h >> 8) & 255}.${h & 255}`;
}
