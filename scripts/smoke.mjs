#!/usr/bin/env node
// Read-only checks of the live site. Used after each production deployment and on a schedule.
// It never sends email: every contact request it makes is invalid and is refused before the
// handler reaches the provider.
//
//   node scripts/smoke.mjs                      # check https://onesmall.company
//   EXPECT_SHA=<40-hex> node scripts/smoke.mjs  # also wait until production serves that commit
//
// Exit codes: 0 all passed; 1 a check failed. Each failure is labelled "functional" (the site
// answered wrongly) or "network" (no answer after retries), and a summary goes to
// $GITHUB_STEP_SUMMARY when it is set.

import { appendFileSync } from "node:fs";

const SITE = "https://onesmall.company";
const ALIAS = "https://joshsmall-portfolio.vercel.app";
const EXPECT_SHA = (process.env.EXPECT_SHA ?? "").trim();
const COMMIT_WAIT_MS = Number(process.env.COMMIT_WAIT_MS ?? 5 * 60_000);
const REQUIRED_HEADERS = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
];

if (EXPECT_SHA && !/^[0-9a-f]{40}$/.test(EXPECT_SHA)) {
  console.error("EXPECT_SHA must be a full 40-character commit SHA");
  process.exit(1);
}

class NetworkError extends Error {}
class Blocked extends Error {}
const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch with a timeout and bounded retries on network errors and 5xx answers. */
async function get(url, init = {}, attempts = 3) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        redirect: "manual",
        ...init,
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "onesmall-smoke-check", ...init.headers },
      });
      if (res.status < 500 || i === attempts) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (err) {
      last = err;
    }
    await sleep(1_000 * 2 ** i);
  }
  throw new NetworkError(`${url}: ${last?.cause?.code ?? last?.message ?? last}`);
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function check(name, fn) {
  const started = Date.now();
  try {
    const note = await fn();
    results.push({ name, ok: true, note: note ?? "", ms: Date.now() - started });
    console.log(`ok    ${name}${note ? ` (${note})` : ""}`);
  } catch (err) {
    const kind =
      err instanceof NetworkError ? "network" : err instanceof Blocked ? "blocked by an earlier failure" : "functional";
    results.push({ name, ok: false, kind, note: err.message, ms: Date.now() - started });
    console.log(`FAIL  ${name} [${kind}]: ${err.message}`);
    if (process.env.GITHUB_ACTIONS) console.log(`::error title=${name} (${kind})::${err.message.replace(/\n/g, " ")}`);
  }
}

let homeHtml = "";

await check("production serves the expected commit", async () => {
  const deadline = Date.now() + (EXPECT_SHA ? COMMIT_WAIT_MS : 0);
  for (;;) {
    const res = await get(`${SITE}/`, { headers: { "cache-control": "no-cache" } });
    const served = res.headers.get("x-build-commit") ?? "";
    if (!EXPECT_SHA) return served ? `serving ${served.slice(0, 12)}` : "no commit header (deployment predates it)";
    if (served === EXPECT_SHA) return `serving ${served.slice(0, 12)}`;
    if (Date.now() > deadline)
      throw new Error(
        `expected ${EXPECT_SHA.slice(0, 12)}, serving ${served.slice(0, 12) || "unknown"} after ${COMMIT_WAIT_MS / 1000}s`,
      );
    await sleep(15_000);
  }
});

await check("home page renders with security headers", async () => {
  const res = await get(`${SITE}/`);
  assert(res.status === 200, `status ${res.status}`);
  assert((res.headers.get("content-type") ?? "").includes("text/html"), "not HTML");
  for (const h of REQUIRED_HEADERS) assert(res.headers.get(h), `missing header ${h}`);
  assert(!res.headers.get("x-powered-by"), "X-Powered-By is present");
  assert(!(res.headers.get("content-security-policy") ?? "").includes("unsafe-eval"), "CSP allows unsafe-eval");
  homeHtml = await res.text();
  assert(homeHtml.includes("Joshua M. Small"), "owner name missing from the page");
  assert(/<h1[\s>]/.test(homeHtml), "no h1");
});

await check("canonical, social metadata and structured data agree", async () => {
  if (!homeHtml) throw new Blocked("home page not loaded");
  const attr = (re) => homeHtml.match(re)?.[1];
  const canonical = attr(/<link rel="canonical" href="([^"]+)"/);
  assert(canonical && new URL(canonical).href === `${SITE}/`, `canonical is ${canonical}`);
  const ogUrl = attr(/<meta property="og:url" content="([^"]+)"/);
  assert(ogUrl && new URL(ogUrl).href === `${SITE}/`, `og:url is ${ogUrl}`);
  const ogImage = attr(/<meta property="og:image" content="([^"]+)"/);
  assert(ogImage?.startsWith(`${SITE}/`), `og:image is ${ogImage}`);
  const img = await get(ogImage);
  assert(
    img.status === 200 && img.headers.get("content-type") === "image/png",
    `share image ${img.status} ${img.headers.get("content-type")}`,
  );
  const ld = attr(/<script type="application\/ld\+json">([^<]+)<\/script>/);
  const graph = JSON.parse(ld)["@graph"];
  const person = graph.find((n) => n["@type"] === "Person");
  assert(person?.name === "Joshua M. Small" && person.url === `${SITE}/`, "Person structured data does not match");
});

await check("first-party scripts and styles load with the right types", async () => {
  if (!homeHtml) throw new Blocked("home page not loaded");
  const assets = [
    ...new Set([...homeHtml.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.(?:js|css))"/g)].map((m) => m[1])),
  ];
  assert(assets.length > 0, "no /_next/static assets referenced");
  for (const path of assets.slice(0, 25)) {
    const res = await get(`${SITE}${path}`);
    const type = res.headers.get("content-type") ?? "";
    assert(res.status === 200, `${path}: ${res.status}`);
    assert(path.endsWith(".css") ? type.includes("text/css") : type.includes("javascript"), `${path}: ${type}`);
  }
  return `${Math.min(assets.length, 25)} assets`;
});

await check("robots.txt and sitemap.xml point at the canonical host", async () => {
  const robots = await (await get(`${SITE}/robots.txt`)).text();
  assert(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), "robots.txt has no canonical sitemap");
  assert(/Allow: \//.test(robots), "robots.txt does not allow crawling");
  const sitemap = await (await get(`${SITE}/sitemap.xml`)).text();
  assert(sitemap.includes(`<loc>${SITE}/</loc>`), "sitemap does not list the home page");
});

await check("the Vercel alias redirects permanently to the canonical domain", async () => {
  for (const path of ["/", "/robots.txt"]) {
    const res = await get(`${ALIAS}${path}`);
    assert([301, 308].includes(res.status), `${path}: status ${res.status}`);
    assert(res.headers.get("location") === `${SITE}${path}`, `${path}: location ${res.headers.get("location")}`);
  }
});

await check("unknown routes return 404 and are not indexed", async () => {
  const res = await get(`${SITE}/smoke-check-no-such-page`);
  assert(res.status === 404, `status ${res.status}`);
  assert(/<meta name="robots" content="[^"]*noindex/.test(await res.text()), "404 page is indexable");
});

await check("contact API validates without sending anything", async () => {
  const post = (body, headers = {}) =>
    get(
      `${SITE}/api/contact`,
      { method: "POST", body, headers: { "content-type": "application/json", ...headers } },
      2,
    );
  const empty = await post("{}");
  assert(empty.status === 400, `empty body: ${empty.status}`);
  assert(
    (empty.headers.get("cache-control") ?? "").includes("no-store") ||
      (empty.headers.get("cache-control") ?? "").includes("private"),
    `empty body cache-control: ${empty.headers.get("cache-control")}`,
  );
  const fields = (await empty.json()).fields ?? {};
  assert(fields.name && fields.email && fields.message, "field errors missing");
  const bad = await post('{"name":"Smoke","email":"not-an-email","message":"smoke check"}');
  assert(bad.status === 400, `invalid email: ${bad.status}`);
  const type = await post("name=x", { "content-type": "text/plain" });
  assert(type.status === 415, `text/plain: ${type.status}`);
  const cross = await post("{}", { origin: "https://smoke-check.invalid" });
  assert(cross.status === 403, `cross-site origin: ${cross.status}`);
  const method = await get(`${SITE}/api/contact`, {}, 2);
  assert(method.status === 405, `GET: ${method.status}`);
});

// Escapes text for a Markdown table cell: backslashes first, then pipes; newlines become spaces.
const mdCell = (text) =>
  String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/[\r\n]+/g, " ");

const failed = results.filter((r) => !r.ok);
if (process.env.GITHUB_STEP_SUMMARY) {
  const rows = results.map(
    (r) => `| ${r.ok ? "✅" : "❌"} | ${r.name} | ${r.ok ? "" : r.kind} | ${mdCell(r.note)} | ${r.ms} |`,
  );
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `### Production checks for ${SITE}`,
      EXPECT_SHA ? `Expected commit: \`${EXPECT_SHA}\`` : "",
      "",
      "| | Check | Failure type | Detail | ms |",
      "|---|---|---|---|---|",
      ...rows,
      "",
    ].join("\n"),
  );
}
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
