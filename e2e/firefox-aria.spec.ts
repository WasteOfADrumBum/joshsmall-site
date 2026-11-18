import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./support/fixtures";

// Playwright 1.65's Firefox 159 crashes if a named locator and axe both read
// ariaLabelledByElements (Mozilla bug 2090055). The fixture resolves a set aria-labelledby
// without that native getter. This fails closed if the fixture is removed: the scan throws
// "Page crashed" instead of returning violations.
test("a named locator and an axe scan both survive aria-labelledby @cross", async ({ page, browserName }) => {
  test.skip(browserName !== "firefox", "only Firefox 159 crashes on the reflected property");
  await page.setContent(`
    <main>
      <h1 id="save-label">Save</h1>
      <button id="save" aria-labelledby="save-label"></button>
      <label for="name">Name</label>
      <input id="name" />
      <button type="button"></button>
    </main>
  `);
  await expect(page.getByRole("button", { name: "Save" })).toHaveCount(1);
  await expect(page.getByLabel("Name")).toHaveCount(1);
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toContain("button-name");
});
