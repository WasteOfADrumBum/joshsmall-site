import type { Response } from "@playwright/test";
import { profile, projects } from "../src/content/site";
import { expect, gotoHome, test } from "./support/fixtures";

// Deterministic budgets for the built home page. Sizes are compressed transfer sizes from the local
// production server (gzip); Vercel serves brotli, which is smaller. Raise a budget only with a reason
// recorded in docs/ci/EVIDENCE.md. Measured on 2026-11-05 at first load: JS 199 KB, CSS 9 KB, fonts 45 KB,
// images 10 KB. The 603 KB chibi sprite sheet loads afterwards, when the portrait pops, and has its own cap.
const BUDGET_KB = { script: 240, stylesheet: 16, font: 80, image: 100 };
const LARGEST_DEFERRED_IMAGE_KB = 650;
const CANONICAL = "https://onesmall.company/";

async function loadAndCollect(page: import("@playwright/test").Page, includeDeferred = true) {
  const responses: Response[] = [];
  page.on("response", (r) => responses.push(r));
  await gotoHome(page);
  await page.waitForLoadState("networkidle");
  // Optionally give the portrait time to pop and fetch its sprite sheet, so that weight is seen too.
  if (includeDeferred) await page.waitForTimeout(3_500);
  return responses;
}

const kbOf = async (r: Response) => (await r.request().sizes()).responseBodySize / 1024;

test.describe("performance budgets", () => {
  test("first-load JS, CSS, font and image weight stay within budget", async ({ page }) => {
    const responses = await loadAndCollect(page, false);
    const kb: Record<string, number> = { script: 0, stylesheet: 0, font: 0, image: 0 };
    for (const r of responses) {
      const type = r.request().resourceType();
      // The sprite sheet is fetched by script for the portrait pop; when it starts depends on timing,
      // so it is held to its own cap below instead of making this total flaky.
      if (r.url().includes("/avatar/")) continue;
      if (type in kb) kb[type] += await kbOf(r);
    }
    test.info().annotations.push({
      type: "first-load-kb",
      description: JSON.stringify(kb, (_, v) => (typeof v === "number" ? Math.round(v) : v)),
    });
    for (const [type, limit] of Object.entries(BUDGET_KB))
      expect(Math.round(kb[type]), `${type} KB`).toBeLessThanOrEqual(limit);
  });

  test("no image loaded later is larger than its cap", async ({ page }) => {
    const responses = await loadAndCollect(page);
    for (const r of responses.filter((r) => r.request().resourceType() === "image")) {
      expect(Math.round(await kbOf(r)), r.url()).toBeLessThanOrEqual(LARGEST_DEFERRED_IMAGE_KB);
    }
  });

  test("nothing loads from third-party origins", async ({ page, baseURL }) => {
    const responses = await loadAndCollect(page);
    const origin = new URL(baseURL!).origin;
    const foreign = responses
      .map((r) => r.url())
      .filter((u) => !u.startsWith(origin) && !u.startsWith("data:") && !u.startsWith("blob:"));
    expect(foreign).toEqual([]);
  });

  test("first-party assets are served with the right content types", async ({ page }) => {
    const responses = await loadAndCollect(page);
    const expected: Record<string, RegExp> = {
      script: /javascript/,
      stylesheet: /text\/css/,
      font: /font\/woff2/,
      image: /^image\//,
    };
    for (const r of responses) {
      const want = expected[r.request().resourceType()];
      if (want) expect(r.headers()["content-type"], r.url()).toMatch(want);
    }
  });

  test("the portrait uses a responsive image close to its displayed size", async ({ page }) => {
    await gotoHome(page);
    const img = page.getByRole("img", { name: profile.photoAlt });
    const info = await img.evaluate((el: HTMLImageElement) => ({
      natural: el.naturalWidth,
      shown: el.getBoundingClientRect().width,
      dpr: devicePixelRatio,
      srcset: !!el.srcset,
    }));
    expect(info.srcset).toBe(true);
    expect(info.natural / (info.shown * info.dpr)).toBeLessThanOrEqual(2);
  });

  test("layout stays stable while the page, fonts and animations load", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "The Layout Instability API exists only in Chromium");
    await gotoHome(page);
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[])
              if (!e.hadRecentInput) total += e.value;
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 3_000);
        }),
    );
    expect(cls).toBeLessThan(0.1);
  });
});

test.describe("SEO and sharing", () => {
  test("title, description, canonical and social metadata are consistent", async ({ page }) => {
    await gotoHome(page);
    const title = await page.title();
    expect(title).toContain(profile.name);
    const meta = (sel: string) => page.locator(sel).getAttribute("content");
    const description = await meta('meta[name="description"]');
    expect(description?.length ?? 0).toBeGreaterThan(50);
    // Next.js writes the root canonical without the trailing slash; both forms are the same URL.
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).href).toBe(CANONICAL);
    expect(await meta('meta[property="og:title"]')).toBe(title);
    expect(await meta('meta[property="og:description"]')).toBe(description);
    expect(new URL((await meta('meta[property="og:url"]'))!).href).toBe(CANONICAL);
    expect(await meta('meta[property="og:image:alt"]')).toBeTruthy();
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
  });

  test("the share image exists at the declared size", async ({ page, request }) => {
    await gotoHome(page);
    const url = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
    expect(url.origin).toBe("https://onesmall.company");
    const res = await request.get(url.pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
    const png = await res.body();
    // PNG IHDR: width and height are big-endian at bytes 16 and 20.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(await page.locator('meta[property="og:image:width"]').getAttribute("content")).toBe("1200");
    expect(await page.locator('meta[property="og:image:height"]').getAttribute("content")).toBe("630");
  });

  test("structured data is valid JSON and matches what the page shows", async ({ page, request }) => {
    await gotoHome(page);
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw!);
    const person = data["@graph"].find((n: { "@type": string }) => n["@type"] === "Person");
    const site = data["@graph"].find((n: { "@type": string }) => n["@type"] === "WebSite");
    expect(person.name).toBe(profile.name);
    expect(person.url).toBe(CANONICAL);
    expect(site.url).toBe(CANONICAL);
    // Compared case-insensitively: some labels are uppercased with CSS.
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toContain(person.jobTitle.toLowerCase());
    expect(text).toContain(person.worksFor.name.toLowerCase());
    for (const link of person.sameAs) await expect(page.locator(`a[href="${link}"]`).first()).toBeAttached();
    const image = new URL(person.image);
    expect((await request.get(image.pathname)).status()).toBe(200);
  });

  test("sitemap lists the canonical page and robots blocks non-production hosts", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain(`<loc>${CANONICAL}</loc>`);
    // The local server is not onesmall.company, so it must not invite crawling.
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \//);
    expect(robots).not.toContain("Sitemap:");
  });

  test("project links point at their own hosts", async () => {
    for (const p of projects) {
      if (p.liveUrl) expect(new URL(p.liveUrl).protocol).toBe("https:");
      if (p.repoUrl) expect(p.repoUrl).toMatch(/^https:\/\/github\.com\/WasteOfADrumBum\//);
    }
  });
});

test.describe("security headers of the built app", () => {
  test("every page response carries the security headers and no framework banner", async ({ request }) => {
    for (const path of ["/", "/sitemap.xml", "/no-such-page"]) {
      const res = await request.get(path);
      const h = res.headers();
      for (const name of [
        "content-security-policy",
        "strict-transport-security",
        "x-content-type-options",
        "x-frame-options",
        "referrer-policy",
        "permissions-policy",
      ]) {
        expect(h[name], `${name} on ${path}`).toBeTruthy();
      }
      expect(h["x-powered-by"], path).toBeUndefined();
      expect(h["content-security-policy"]).not.toContain("unsafe-eval");
      expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    }
  });

  test("the build reports its commit in X-Build-Commit", async ({ request }) => {
    const expected = (process.env.BUILD_COMMIT_SHA ?? "").trim();
    test.skip(!expected, "Set BUILD_COMMIT_SHA for both the build and the tests to check this (CI does)");
    const res = await request.get("/");
    expect(res.headers()["x-build-commit"]).toBe(expected);
  });

  test("the home page is publicly cacheable and the contact API is not", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["cache-control"]).toMatch(/s-maxage|public|max-age/);
    const api = await request.post("/api/contact", { headers: { "content-type": "application/json" }, data: {} });
    expect(api.headers()["cache-control"]).toMatch(/no-store/);
  });
});
