import { nav, profile, projects, sideProjects } from "../src/content/site";
import type { Page } from "@playwright/test";
import { expect, gotoHome, test } from "./support/fixtures";

/** Smooth scrolling is on; history remembers the scroll position at the moment you leave, so wait for it to stop. */
async function scrollSettled(page: Page) {
  await expect
    .poll(async () => {
      const a = await page.evaluate(() => scrollY);
      await page.waitForTimeout(150);
      return a === (await page.evaluate(() => scrollY));
    })
    .toBe(true);
}

// Content is read from src/content/site.ts, so editing copy never breaks these tests.

test.describe("home page", () => {
  test("renders the hero, every section and the footer @cross", async ({ page }) => {
    await gotoHome(page);
    await expect(page).toHaveTitle(new RegExp(profile.name.replace(".", "\\.")));
    await expect(page.getByRole("heading", { level: 1, name: profile.headline })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(profile.name);
    for (const item of nav) {
      await expect(page.locator(item.href), `section ${item.href}`).toHaveCount(1);
    }
  });

  test("primary navigation scrolls to each section and marks it current", async ({ page }) => {
    await gotoHome(page);
    const primary = page.getByRole("navigation", { name: "Primary" });
    for (const item of nav.filter((n) => n.href !== "#beyond")) {
      await primary.getByRole("link", { name: item.label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${item.href}$`));
      await expect(page.locator(item.href)).toBeInViewport();
      await expect(primary.getByRole("link", { name: item.label, exact: true })).toHaveAttribute(
        "aria-current",
        "location",
      );
    }
  });

  test("back and forward move between visited sections", async ({ page }) => {
    await gotoHome(page);
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("link", { name: "Projects", exact: true }).click();
    await expect(page.locator("#projects")).toBeInViewport();
    await scrollSettled(page);
    await primary.getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
    await scrollSettled(page);
    await page.goBack();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
    await scrollSettled(page);
    await page.goForward();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("direct navigation to a section and a refresh both land on it", async ({ page }) => {
    await page.goto("/#experience");
    await expect(page.locator("#experience")).toBeInViewport();
    await page.reload();
    await expect(page.locator("#experience")).toBeInViewport();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });
});

test.describe("projects", () => {
  test("lists every project with working links @cross", async ({ page }) => {
    await gotoHome(page, "/#projects");
    const section = page.locator("#projects");
    for (const p of projects) {
      const card = section
        .getByRole("article")
        .filter({ has: page.getByRole("heading", { name: p.title, exact: true }) });
      await expect(card).toBeVisible();
      if (p.liveUrl) await expect(card.getByRole("link", { name: /View live/ })).toHaveAttribute("href", p.liveUrl);
      if (p.repoUrl) await expect(card.getByRole("link", { name: /Source code/ })).toHaveAttribute("href", p.repoUrl);
    }
  });

  test("side-project links open safely in a new tab", async ({ page }) => {
    await gotoHome(page, "/#beyond");
    for (const s of sideProjects.filter((s) => s.url)) {
      const link = page.getByRole("link", { name: `Visit site for ${s.title}` });
      await expect(link).toHaveAttribute("href", s.url!);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });
});

test.describe("hero controls", () => {
  test("pause stops the rotating headline and play resumes it", async ({ page }) => {
    await gotoHome(page);
    const pause = page.getByRole("button", { name: "Pause headline animation" });
    await pause.click();
    const play = page.getByRole("button", { name: "Play headline animation" });
    await expect(play).toBeVisible();
    const word = page.locator("#hero-title .text-sweep");
    const before = await word.textContent();
    await page.waitForTimeout(3600); // longer than one 3.2 s rotation
    await expect(word).toHaveText(before ?? "");
    await play.click();
    await expect(word).not.toHaveText(before ?? "", { timeout: 5_000 });
  });

  test("portrait toggle switches between photo and chibi @cross", async ({ page }) => {
    await gotoHome(page);
    const group = page.getByRole("group", { name: "Portrait view" });
    const photo = group.getByRole("button", { name: "My photo" });
    const chibi = group.getByRole("button", { name: "Chibi me" });
    await chibi.click();
    await expect(chibi).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("img", { name: profile.avatarAlt })).toBeVisible();
    await photo.click();
    await expect(photo).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("img", { name: profile.photoAlt })).toBeVisible();
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("opens, navigates and closes by tap @cross", async ({ page }) => {
    await gotoHome(page);
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.tap();
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await menu.getByRole("link", { name: "Contact", exact: true }).tap();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("works from the keyboard and Escape returns focus to the button @cross", async ({ page }) => {
    await gotoHome(page);
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    const menu = page.locator("#mobile-menu");
    await expect(menu).toBeVisible();
    // The menu follows its button in the tab order.
    await page.keyboard.press("Tab");
    await expect(menu.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    // The close button works too.
    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
  });
});

test.describe("unknown routes", () => {
  test.use({
    allowedProblems:
      /^(http 404: GET \S+\/no-such-page|console\.error: Failed to load resource: the server responded with a status of 404)/,
  });

  test("show the not-found page with a 404 status @cross", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /404|could not be found/i }).first()).toBeVisible();
    // Not-found pages must not be indexed.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("unknown API paths return 404", async ({ request }) => {
    expect((await request.get("/api/no-such-endpoint")).status()).toBe(404);
  });
});
