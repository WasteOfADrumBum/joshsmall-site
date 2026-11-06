#!/usr/bin/env node
// Reports whether main is protected by a rule that requires the "CI gate" check. This is detection
// only: it cannot stop an unprotected merge. Uses the public "rules for a branch" API, which needs
// no admin rights. Prints a warning annotation and exits 0, so a missing rule is visible on every
// scheduled run without paging anyone.
import { appendFileSync } from "node:fs";

const repo = process.env.GITHUB_REPOSITORY ?? "WasteOfADrumBum/joshsmall-site";
const headers = { accept: "application/vnd.github+json", "user-agent": "onesmall-protection-check" };
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(`https://api.github.com/repos/${repo}/rules/branches/main`, {
  headers,
  signal: AbortSignal.timeout(15_000),
});
if (!res.ok) {
  console.log(`::warning title=Branch protection::Could not read rules for main (HTTP ${res.status})`);
  process.exit(0);
}
const rules = await res.json();
const types = new Set(rules.map((r) => r.type));
const checks = rules
  .filter((r) => r.type === "required_status_checks")
  .flatMap((r) => r.parameters?.required_status_checks ?? []);
const findings = [
  ["pull request required", types.has("pull_request")],
  ['"CI gate" required', checks.some((c) => c.context === "CI gate")],
  [
    "branch must be up to date",
    rules.some((r) => r.type === "required_status_checks" && r.parameters?.strict_required_status_checks_policy),
  ],
  ["force pushes blocked", types.has("non_fast_forward")],
  ["deletion blocked", types.has("deletion")],
];
for (const [name, ok] of findings) {
  console.log(`${ok ? "ok  " : "MISSING"} ${name}`);
  if (!ok)
    console.log(
      `::warning title=Branch protection::main: ${name} is not enforced (see docs/ci/README.md, "Protect main")`,
    );
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    ["### Protection of main", "", ...findings.map(([n, ok]) => `- ${ok ? "✅" : "⚠️"} ${n}`), ""].join("\n"),
  );
}
