#!/usr/bin/env node
// Checks every outbound link in src/content/site.ts with bounded requests. Runs on a schedule, not
// on pull requests, so a third-party outage never blocks a merge.
//   - Links on onesmall.company subdomains and the owner's GitHub repos are first-party: a failure fails the run.
//   - Other sites only warn: many block automated requests (LinkedIn answers 999) or are briefly down.
import { appendFileSync } from "node:fs";
import * as site from "../src/content/site.ts";

const urls = new Set();
(function walk(v) {
  if (typeof v === "string" && /^https?:\/\//.test(v)) urls.add(v);
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object") Object.values(v).forEach(walk);
})(site);

const firstParty = (u) =>
  /^https:\/\/([a-z0-9-]+\.)?onesmall\.company(\/|$)/.test(u) || u.startsWith("https://github.com/WasteOfADrumBum");

async function probe(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
        headers: { "user-agent": "onesmall-link-check" },
      });
      await res.body?.cancel();
      if (res.status < 400) return { ok: true, status: res.status };
      if (attempt === 2 || res.status < 500) return { ok: false, status: res.status };
    } catch (err) {
      if (attempt === 2) return { ok: false, status: err.cause?.code ?? err.name };
    }
    await new Promise((r) => setTimeout(r, 3_000));
  }
}

const rows = [];
let failures = 0;
const list = [...urls].sort();
for (let i = 0; i < list.length; i += 6) {
  await Promise.all(
    list.slice(i, i + 6).map(async (url) => {
      const r = await probe(url);
      const fp = firstParty(url);
      if (!r.ok && fp) failures++;
      const level = r.ok ? "ok" : fp ? "FAIL" : "warn";
      if (!r.ok && process.env.GITHUB_ACTIONS)
        console.log(`::${fp ? "error" : "warning"} title=Link check::${url} -> ${r.status}`);
      console.log(`${level.padEnd(5)} ${r.status} ${url}`);
      rows.push(`| ${level} | ${fp ? "first-party" : "third-party"} | ${r.status} | ${url} |`);
    }),
  );
}
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    ["### Outbound links", "", "| Result | Owner | Status | URL |", "|---|---|---|---|", ...rows.sort(), ""].join("\n"),
  );
}
console.log(`\n${list.length} links, ${failures} first-party failures`);
process.exit(failures ? 1 : 0);
