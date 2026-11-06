#!/usr/bin/env node
// Summarises the weekly Lighthouse runs in lh/ as medians. Lab data from shared runners is noisy,
// so this is a trend to watch, never a pass/fail gate.
import { appendFileSync, existsSync, readFileSync } from "node:fs";

const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
const rows = [
  "### Lighthouse medians (lab data, 3 runs; a trend, not a verdict)",
  "",
  "| Form factor | Perf | A11y | Best practices | SEO | LCP ms | CLS | TBT ms |",
  "|---|---|---|---|---|---|---|---|",
];
for (const preset of ["mobile", "desktop"]) {
  const runs = [1, 2, 3]
    .map((i) => `lh/${preset}-${i}.json`)
    .filter(existsSync)
    .map((f) => JSON.parse(readFileSync(f, "utf8")));
  if (!runs.length) {
    rows.push(`| ${preset} | no successful runs | | | | | | |`);
    continue;
  }
  const score = (k) => median(runs.map((r) => Math.round(r.categories[k].score * 100)));
  const audit = (k) => median(runs.map((r) => r.audits[k].numericValue));
  rows.push(
    `| ${preset} | ${score("performance")} | ${score("accessibility")} | ${score("best-practices")} | ${score("seo")} | ${Math.round(audit("largest-contentful-paint"))} | ${audit("cumulative-layout-shift").toFixed(3)} | ${Math.round(audit("total-blocking-time"))} |`,
  );
}
console.log(rows.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, rows.join("\n") + "\n");
