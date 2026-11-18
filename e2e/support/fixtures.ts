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
  firefoxAriaReflection: void;
};

/**
 * Firefox 159 (Playwright 1.65, browser build 1572) kills the content process if
 * `ariaLabelledByElements` is read from the page and from Playwright's utility world.
 * axe-core 4.14 reads that property, and `getByRole` / `getByLabel` do too, so a scan after a
 * named locator crashes the tab (Mozilla bug 2090055). Sections on this site are named with
 * `aria-labelledby`. When that attribute is set, resolve the ids here and leave the native getter
 * alone; an empty attribute still uses the browser, which is only the script-set case this page
 * does not use. Drop this once Playwright ships a Firefox newer than build 1572.
 */
function firefoxAriaLabelledBy() {
  const desc = Object.getOwnPropertyDescriptor(Element.prototype, "ariaLabelledByElements");
  if (!desc?.get) return;
  const nativeGet = desc.get;
  Object.defineProperty(Element.prototype, "ariaLabelledByElements", {
    configurable: true,
    enumerable: desc.enumerable,
    get(this: Element) {
      const attr = this.getAttribute("aria-labelledby");
      if (attr == null || attr === "") return nativeGet.call(this);
      const root = this.getRootNode();
      const byId = (id: string) =>
        root instanceof Document || root instanceof ShadowRoot ? root.getElementById(id) : null;
      return attr
        .trim()
        .split(/\s+/)
        .map((id: string) => byId(id))
        .filter((el: Element | null): el is Element => el instanceof Element);
    },
    set: desc.set,
  });
}

export const test = base.extend<Fixtures>({
  allowedProblems: [null, { option: true }],
  firefoxAriaReflection: [
    async ({ context, browserName }, use) => {
      if (browserName === "firefox") await context.addInitScript(firefoxAriaLabelledBy);
      await use();
    },
    { auto: true },
  ],
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
          try {
            const response = await route.fetch();
            const headers = { ...response.headers() };
            delete headers["strict-transport-security"];
            if (headers["content-security-policy"]) {
              headers["content-security-policy"] = headers["content-security-policy"]
                .split(";")
                .filter((d) => d.trim() !== "upgrade-insecure-requests")
                .join(";");
            }
            // Keep the fetched response, including its compressed body. Copying response.body()
            // and fulfilling that sends the decompressed bytes, so the transfer-size budget sees
            // the whole script instead of the gzip the server actually sent.
            await route.fulfill({ response, headers });
          } catch (error) {
            // WebKit aborts some requests while the fetch is in flight and then disposes the
            // response. There is nothing left to deliver, and throwing fails the test.
            const message = error instanceof Error ? error.message : String(error);
            if (
              /Response has been disposed|Route is already handled|Target (page|closed)|Request context disposed|browser has been closed|ERR_ABORTED/i.test(
                message,
              )
            ) {
              return;
            }
            throw error;
          }
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

/** Waits until the page stops scrolling (smooth scrolling to a #section or scroll restoration). */
export async function scrollSettled(page: Page) {
  await expect
    .poll(async () => {
      const a = await page.evaluate(() => scrollY);
      await page.waitForTimeout(150);
      return a === (await page.evaluate(() => scrollY));
    })
    .toBe(true);
}

/**
 * Loads the home page and waits until React has hydrated (the portrait toggle only renders on the
 * client). With a #section, also waits for the browser to finish scrolling there, so a click does
 * not land on a target that is still moving.
 */
export async function gotoHome(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("group", { name: "Portrait view" })).toBeVisible();
  if (path.includes("#")) await scrollSettled(page);
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
