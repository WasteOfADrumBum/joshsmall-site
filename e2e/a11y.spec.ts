import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { nav, profile } from "../src/content/site";
import { contactForm, submission } from "./support/contact";
import { clientIp, expect, gotoHome, test, runId } from "./support/fixtures";

// Automated checks for applicable WCAG 2.2 AA criteria. Passing them is not full conformance:
// screen-reader output, real zoom and visual judgement still need people (see docs/ci/EVIDENCE.md).

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function axe(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(TAGS);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  return violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

/**
 * Waits until entrance animations inside `selector` have finished, so axe never measures contrast on
 * a half-faded element. Motion runs its fades as Web Animations while the inline style still reads
 * the start value, so inline styles alone are not enough: this also waits for every finite
 * script-created animation in the section (CSS animations, such as the looping headline, are left out).
 * "At rest" means no such animation is running and two samples 250 ms apart match.
 */
async function settle(page: Page, selector: string) {
  const sample = () =>
    page.locator(selector).evaluate(async (root) => {
      const running = document.getAnimations().filter((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target;
        return (
          !(a instanceof CSSAnimation) &&
          !(a instanceof CSSTransition) &&
          (a.playState === "running" || a.pending) &&
          Number.isFinite(a.effect?.getComputedTiming().endTime) &&
          target instanceof Element &&
          root.contains(target)
        );
      });
      await Promise.all(running.map((a) => a.finished.catch(() => undefined)));
      const opacities = [...root.querySelectorAll<HTMLElement>("[style*=opacity]")].map((el) => el.style.opacity);
      return `${running.length}|${opacities.join(",")}`;
    });
  let previous = await sample();
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(250);
    const next = await sample();
    if (next === previous && next.startsWith("0|")) return;
    previous = next;
  }
  throw new Error(`animations in ${selector} did not settle`);
}

/** Scrolls each section into view, lets its entrance animation settle, then checks it. */
async function axeEverySection(page: Page) {
  const problems: string[] = [];
  for (const id of ["top", ...nav.map((n) => n.href.slice(1))]) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await settle(page, `#${id}`);
    problems.push(...(await axe(page, `#${id}`)).map((p) => `#${id}: ${p}`));
  }
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  problems.push(...(await axe(page, "header")), ...(await axe(page, "footer")));
  return problems;
}

test.describe("axe", () => {
  // Each test waits for every section's entrance animation in turn before checking it.
  test.describe.configure({ timeout: 90_000 });

  for (const colorScheme of ["dark", "light"] as const) {
    test(`every section passes in ${colorScheme} system mode on desktop`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await gotoHome(page);
      expect(await axeEverySection(page)).toEqual([]);
    });
  }

  test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test("every section passes", async ({ page }) => {
      await gotoHome(page);
      expect(await axeEverySection(page)).toEqual([]);
    });

    test("the open mobile menu passes", async ({ page }) => {
      await gotoHome(page);
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(page.locator("#mobile-menu")).toBeVisible();
      expect(await axe(page, "header")).toEqual([]);
    });
  });

  test("reduced motion passes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoHome(page);
    expect(await axeEverySection(page)).toEqual([]);
  });

  test.describe("contact form states", () => {
    test.use({
      allowedProblems:
        /^(http 502: POST \S+\/api\/contact|console\.error: Failed to load resource: the server responded with a status of 502)/,
    });

    test("validation errors, failure and success all pass", async ({ page }, testInfo) => {
      await page.setExtraHTTPHeaders({ "x-forwarded-for": clientIp(runId(testInfo)) });
      await gotoHome(page, "/#contact");
      const f = contactForm(page);
      await settle(page, "#contact");
      await f.submit.click();
      await expect(f.name).toHaveAttribute("aria-invalid", "true");
      expect(await axe(page, "#contact form")).toEqual([]);

      await f.fill(submission(runId(testInfo), "e2e-reject"));
      await f.submit.click();
      await expect(f.status).toContainText("Couldn't send");
      expect(await axe(page, "#contact form")).toEqual([]);

      await f.fill(submission(`${runId(testInfo)}-ok`));
      await f.submit.click();
      await expect(f.status).toContainText("Your message was sent");
      expect(await axe(page, "#contact form")).toEqual([]);
    });
  });
});

test.describe("structure", () => {
  test("landmarks, one h1 and no skipped heading levels", async ({ page }) => {
    await gotoHome(page);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    // The animated headline is aria-hidden; assistive tech gets the full sentence once.
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(profile.headline);
    const levels = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .evaluateAll((els) =>
        els
          .filter((e) => e.getClientRects().length > 0 || e.classList.contains("sr-only"))
          .map((e) => Number(e.tagName[1])),
      );
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("informative images have text alternatives and decorative ones are hidden", async ({ page }) => {
    await gotoHome(page);
    await expect(page.getByRole("img", { name: profile.photoAlt })).toBeAttached();
    const imgs = await page.locator("img").evaluateAll((els) =>
      els.map((e) => ({
        src: e.getAttribute("src"),
        alt: e.getAttribute("alt"),
        hidden: !!e.closest('[aria-hidden="true"]'),
      })),
    );
    for (const img of imgs) expect(img.alt, `img ${img.src} needs an alt attribute`).not.toBeNull();
    // Inline SVG icons must be hidden or labelled.
    const unlabeled = await page
      .locator("svg")
      .evaluateAll(
        (els) =>
          els.filter(
            (e) =>
              !e.closest('[aria-hidden="true"]') &&
              e.getAttribute("aria-hidden") !== "true" &&
              !e.getAttribute("aria-label") &&
              e.getAttribute("role") !== "img",
          ).length,
      );
    expect(unlabeled).toBe(0);
  });
});

test.describe("keyboard", () => {
  test("the skip link is first, visible on focus and moves to the main content @cross", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Safari skips links on Tab unless the user enables it; checked in Chromium and Firefox",
    );
    await gotoHome(page);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await page.keyboard.press("Tab");
    // Focus continues inside main, not back in the header.
    expect(await page.evaluate(() => !!document.activeElement?.closest("main"))).toBe(true);
  });

  test("every focus stop in the first part of the page shows a visible indicator", async ({ page }) => {
    await gotoHome(page);
    const seen: string[] = [];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const s = getComputedStyle(el);
        return {
          label: `${el.tagName} ${(el.textContent ?? "").trim().slice(0, 30)}`,
          outline: s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2,
          shadow: s.boxShadow !== "none",
        };
      });
      if (!info) break;
      seen.push(info.label);
      expect(info.outline || info.shadow, `no visible focus on ${info.label}`).toBe(true);
    }
    expect(seen.length).toBeGreaterThan(10);
  });
});

test.describe("motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion stops the headline, the portrait pop and the pinned scroll effect", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoHome(page);
    await expect(page.getByRole("button", { name: /headline animation/ })).toBeHidden();
    const word = page.locator("#hero-title .text-sweep");
    const before = await word.textContent();
    await page.waitForTimeout(3600);
    await expect(word).toHaveText(before ?? "");
    // No automatic switch to the cartoon portrait.
    await expect(
      page.getByRole("group", { name: "Portrait view" }).getByRole("button", { name: "My photo" }),
    ).toHaveAttribute("aria-pressed", "true");
    // The side-project section is a normal grid, not a 210vh pinned scroller.
    const height = await page.locator("#beyond").evaluate((e) => e.getBoundingClientRect().height);
    expect(height).toBeLessThan(900 * 2);
  });
});

test.describe("reflow and text size", () => {
  const noHorizontalScroll = (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  test("content reflows at 320 px without horizontal scrolling @cross", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await gotoHome(page);
    for (const id of ["top", ...nav.map((n) => n.href.slice(1))]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      expect(await noHorizontalScroll(page), `#${id}`).toBeLessThanOrEqual(1);
    }
  });

  test("WCAG text-spacing overrides cause no overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHome(page);
    await page.addStyleTag({
      content:
        "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
    });
    await page.waitForTimeout(200);
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(1);
  });

  test("doubling the base text size keeps the page usable on desktop", async ({ page }) => {
    await gotoHome(page);
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    await page.waitForTimeout(200);
    expect(await noHorizontalScroll(page)).toBeLessThanOrEqual(1);
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(contactForm(page).submit).toBeVisible();
  });
});

test.describe("touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("controls are at least 24 by 24 CSS pixels (WCAG 2.5.8)", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const small = await page.locator("a, button, input, textarea, [role=button]").evaluateAll((els) =>
      els
        .filter((e) => {
          const r = e.getBoundingClientRect();
          const s = getComputedStyle(e);
          // Not rendered, hidden, or visually hidden until focused (the skip link is 1x1 until then).
          if (r.width <= 1 || s.visibility === "hidden" || e.closest('[aria-hidden="true"]')) return false;
          // Links inside a sentence are exempt (inline exception).
          if (e.tagName === "A" && s.display === "inline" && e.parentElement?.tagName === "P") return false;
          return r.width < 24 || r.height < 24;
        })
        .map(
          (e) =>
            `${e.tagName} "${(e.textContent ?? e.getAttribute("aria-label") ?? "").trim().slice(0, 30)}" ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`,
        ),
    );
    expect(small).toEqual([]);
  });
});
