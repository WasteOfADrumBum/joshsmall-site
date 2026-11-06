import { readFileSync } from "node:fs";
import path from "node:path";
import { clientIp, expect, gotoHome, test } from "./support/fixtures";
import { contactForm, expectNoPersonalDataIn, sentTo, submission } from "./support/contact";

// The whole path runs for real: browser form -> /api/contact handler -> Resend SDK -> local stand-in.
// A stand-in "accepted" result shows the handler built and handed off the message; it is not proof
// that a real inbox received anything.

const SEND_FAILED = "Couldn't send your message. Please try again later.";
const serverLog = () => readFileSync(path.join(process.cwd(), "test-results", "server.log"), "utf8");

test.beforeEach(async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": clientIp(testInfo.testId) });
  await gotoHome(page, "/#contact");
});

test("empty submission shows every field error, focuses the first and sends nothing @cross", async ({ page }) => {
  const f = contactForm(page);
  let posted = false;
  page.on("request", (r) => r.url().endsWith("/api/contact") && (posted = true));
  await f.submit.click();
  for (const [field, text] of [
    [f.name, "Name is required."],
    [f.email, "Email is required."],
    [f.message, "Message is required."],
  ] as const) {
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAccessibleDescription(text);
  }
  await expect(f.name).toBeFocused();
  expect(posted).toBe(false);
});

test("a malformed email is flagged and clears once fixed", async ({ page }) => {
  const f = contactForm(page);
  await f.fill({ name: "Tess", email: "tess@", message: "Hello" });
  await f.submit.click();
  await expect(f.email).toHaveAccessibleDescription("Enter a valid email address.");
  await expect(f.email).toBeFocused();
  await expect(f.name).toHaveAttribute("aria-invalid", "false");
  await f.email.fill("tess@example.test");
  await expect(f.email).toHaveAttribute("aria-invalid", "false");
});

test("a valid message goes through the real handler to the provider exactly once @cross", async ({
  page,
}, testInfo) => {
  const f = contactForm(page);
  const s = submission(testInfo.testId);
  await f.fill(s);
  await f.submit.click();
  await expect(f.status).toHaveText("Thanks! Your message was sent. I'll be in touch soon.");
  await expect(f.name).toHaveValue("");
  await expect(f.message).toHaveValue("");
  const sent = await sentTo(s.tag);
  expect(sent).toHaveLength(1);
  expect(sent[0].subject).toBe(`[Portfolio Contact] ${s.name}`);
  expect(sent[0].to).toBe("inbox@example.test");
  expect(sent[0].reply_to).toBe(s.email);
  expect(sent[0].text).toContain(s.message);
});

test("double-clicking send submits once and shows a loading state", async ({ page }, testInfo) => {
  const f = contactForm(page);
  const s = submission(testInfo.testId);
  await f.fill(s);
  let posts = 0;
  page.on("request", (r) => r.url().endsWith("/api/contact") && posts++);
  await f.submit.dblclick();
  await expect(f.status).toContainText("Your message was sent");
  expect(posts).toBe(1);
  expect(await sentTo(s.tag)).toHaveLength(1);
});

test.describe("when sending fails", () => {
  test.use({
    allowedProblems:
      /^(http 502: POST \S+\/api\/contact|console\.error: Failed to load resource: the server responded with a status of 502)/,
  });

  for (const [mode, why] of [
    ["e2e-reject", "the provider refuses the message"],
    ["e2e-500", "the provider has an internal error"],
    ["e2e-drop", "the provider connection drops"],
  ] as const) {
    test(`keeps the text and offers a retry when ${why}`, async ({ page }, testInfo) => {
      const f = contactForm(page);
      const s = submission(testInfo.testId, mode);
      await f.fill(s);
      await f.submit.click();
      await expect(f.status).toHaveText(SEND_FAILED);
      await expect(f.name).toHaveValue(s.name);
      await expect(f.email).toHaveValue(s.email);
      await expect(f.message).toHaveValue(s.message);
      await expect(f.submit).toBeEnabled();
      await expect(f.submit).toHaveText("Send message");
      expect(await sentTo(s.tag)).toHaveLength(0);
      await expectNoPersonalDataIn(serverLog(), s);
    });
  }

  test("a provider that never answers is cut off by the handler and the form recovers", async ({ page }, testInfo) => {
    test.setTimeout(45_000);
    const f = contactForm(page);
    const s = submission(testInfo.testId, "e2e-slow");
    await f.fill(s);
    const started = Date.now();
    await f.submit.click();
    await expect(f.submit).toBeDisabled();
    await expect(f.submit).toHaveText("Sending…");
    await expect(f.status).toHaveText(SEND_FAILED, { timeout: 15_000 });
    const elapsed = Date.now() - started;
    expect(elapsed).toBeGreaterThan(9_000);
    expect(elapsed).toBeLessThan(15_000);
    await expect(f.submit).toBeEnabled();
    await expect(f.message).toHaveValue(s.message);
    await expectNoPersonalDataIn(serverLog(), s);
  });
});

test.describe("when the browser can't reach the server", () => {
  test.use({
    allowedProblems:
      /^(requestfailed: POST \S+\/api\/contact|console\.error: Failed to load resource: net::ERR_INTERNET_DISCONNECTED)/,
  });

  test("says so and keeps the text", async ({ page }, testInfo) => {
    const f = contactForm(page);
    const s = submission(testInfo.testId);
    await page.route("**/api/contact", (route) => route.abort("internetdisconnected"));
    await f.fill(s);
    await f.submit.click();
    await expect(f.status).toHaveText("Couldn't reach the server. Check your connection and try again.");
    await expect(f.message).toHaveValue(s.message);
    await expect(f.submit).toBeEnabled();
  });
});

test("a filled honeypot looks successful to the bot but sends nothing", async ({ page }, testInfo) => {
  const f = contactForm(page);
  const s = submission(testInfo.testId);
  await f.fill(s);
  await f.form.locator('input[name="company"]').fill("Bot Inc", { force: true });
  await f.submit.click();
  await expect(f.status).toContainText("Your message was sent");
  expect(await sentTo(s.tag)).toHaveLength(0);
});

test.describe("rate limiting", () => {
  test.use({
    allowedProblems:
      /^(http 429: POST \S+\/api\/contact|console\.error: Failed to load resource: the server responded with a status of 429)/,
  });

  test("the sixth message from one visitor in ten minutes is refused with a clear message", async ({
    page,
  }, testInfo) => {
    const f = contactForm(page);
    const s = submission(testInfo.testId);
    for (let i = 1; i <= 5; i++) {
      await f.fill({ ...s, message: `${s.message} #${i}` });
      await f.submit.click();
      await expect(f.status).toContainText("Your message was sent");
    }
    await f.fill(s);
    await f.submit.click();
    await expect(f.status).toHaveText("Too many messages in a short time. Please try again in a few minutes.");
    await expect(f.message).toHaveValue(s.message);
    expect(await sentTo(s.tag)).toHaveLength(5);
  });
});
