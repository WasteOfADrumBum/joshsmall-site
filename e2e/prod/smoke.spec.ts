import { nav, profile } from "../../src/content/site";
import { expect, gotoHome, test } from "../support/fixtures";

// Runs against https://onesmall.company. Fails on any page error, console error (hydration errors
// included), failed first-party request or third-party request, through the shared fixture.

test("home page renders, hydrates and loads only first-party resources", async ({ page, baseURL }) => {
  const foreign: string[] = [];
  page.on("request", (r) => {
    const u = r.url();
    if (!u.startsWith(baseURL!) && !u.startsWith("data:") && !u.startsWith("blob:")) foreign.push(u);
  });
  await gotoHome(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(profile.headline);
  for (const item of nav) await expect(page.locator(item.href)).toHaveCount(1);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(page.locator("#contact form").getByRole("button", { name: "Send message" })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(foreign).toEqual([]);
});

test("navigation reaches the contact section", async ({ page, isMobile }) => {
  await gotoHome(page);
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page.locator("#mobile-menu")).toBeHidden();
  } else {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact", exact: true }).click();
  }
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator("#contact")).toBeInViewport();
});

test.describe("unknown route", () => {
  test.use({
    allowedProblems:
      /^(http 404: GET \S+\/smoke-no-such-page|console\.error: Failed to load resource: the server responded with a status of 404)/,
  });

  test("shows the not-found page", async ({ page }) => {
    const res = await page.goto("/smoke-no-such-page");
    expect(res?.status()).toBe(404);
  });
});
