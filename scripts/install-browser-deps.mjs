#!/usr/bin/env node
// Installs Playwright's browser binaries, then only the system libraries a launch still needs.
// Playwright's install-deps also installs CJK, Thai and Unicode fallback fonts. The site
// self-hosts its fonts, and those packages come from the regional Ubuntu mirror that has stalled
// GitHub runners at about 50 KB/s. A browser that already launches skips apt. Otherwise the
// libraries are installed without the fonts, from archive.ubuntu.com. Full install-deps still
// runs if a browser will not launch after that.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const browsers = process.argv.slice(2);
if (browsers.length === 0 || browsers.some((name) => !["chromium", "firefox", "webkit"].includes(name))) {
  console.error("usage: node scripts/install-browser-deps.mjs chromium|firefox|webkit ...");
  process.exit(1);
}

function run(command, args, { input } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: [input == null ? "ignore" : "pipe", "inherit", "inherit"],
      env: { ...process.env, DEBIAN_FRONTEND: "noninteractive" },
    });
    if (input != null) child.stdin.end(input);
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

/** Playwright's Ubuntu package list for this OS, from its own registry. */
function dependencyPackages(names) {
  const require = createRequire(import.meta.url);
  const bundle = readFileSync(require.resolve("playwright-core/lib/coreBundle"), "utf8");
  const version = /VERSION_ID="(\d+)/.exec(readFileSync("/etc/os-release", "utf8"))?.[1];
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  const key = `"ubuntu${version}.04-${arch}": {`;
  const start = bundle.indexOf(key);
  if (start < 0) throw new Error(`Playwright has no dependency list for ubuntu ${version}.04 ${arch}`);
  const slice = bundle.slice(start, start + 120_000);
  const grab = (name) => {
    // A plain search: the name is one of tools, chromium, firefox or webkit, and it is not a pattern.
    const marker = `${name}: [`;
    const at = slice.indexOf(marker);
    if (at < 0) throw new Error(`Playwright dependency list has no ${name} packages`);
    let depth = 0;
    for (let i = at + marker.length - 1; i < slice.length; i++) {
      if (slice[i] === "[") depth++;
      else if (slice[i] === "]") {
        depth--;
        if (depth === 0) return JSON.parse(slice.slice(match.index + match[0].length - 1, i + 1));
      }
    }
    throw new Error(`Playwright dependency list for ${name} is truncated`);
  };
  const packages = new Set();
  for (const name of ["tools", ...names]) for (const pkg of grab(name)) packages.add(pkg);
  // Fallback fonts. xvfb and the fontconfig libraries stay.
  return [...packages].filter((pkg) => !pkg.startsWith("fonts-") && !pkg.startsWith("xfonts-")).sort();
}

async function launch(name) {
  const playwright = await import("@playwright/test");
  const browser = await playwright[name].launch({ timeout: 30_000 });
  await browser.close();
  console.log(`${name} launches with the libraries already installed.`);
}

async function pointAptAtPublicArchive() {
  try {
    readFileSync("/etc/apt/apt-mirrors.txt");
  } catch {
    console.log("No apt mirror list; leaving the system sources alone.");
    return;
  }
  console.log("Pointing apt at archive.ubuntu.com. The regional mirror has stalled these installs.");
  await run("sudo", ["tee", "/etc/apt/apt-mirrors.txt"], { input: "http://archive.ubuntu.com/ubuntu/\n" });
}

const require = createRequire(import.meta.url);
const playwrightPackage = require.resolve("playwright/package.json");
const cli = join(dirname(playwrightPackage), require(playwrightPackage).bin.playwright);
await run(process.execPath, [cli, "install", ...browsers]);

const missing = [];
for (const name of browsers) {
  try {
    await launch(name);
  } catch (error) {
    console.log(`${name} did not launch: ${error.message.split("\n")[0]}`);
    missing.push(name);
  }
}
if (missing.length === 0) process.exit(0);

const packages = dependencyPackages(missing);
console.log(`Installing ${packages.length} libraries, without the optional fallback fonts.`);
await pointAptAtPublicArchive();
await run("sudo", ["apt-get", "update", "-o", "Acquire::Retries=5"]);
await run("sudo", ["apt-get", "install", "-y", "--no-install-recommends", "-o", "Acquire::Retries=5", ...packages]);

const stillMissing = [];
for (const name of missing) {
  try {
    await launch(name);
  } catch (error) {
    console.log(`${name} still did not launch: ${error.message.split("\n")[0]}`);
    stillMissing.push(name);
  }
}
if (stillMissing.length === 0) process.exit(0);

console.log("Running Playwright's full install-deps for the browsers that still will not launch.");
await run(process.execPath, [cli, "install-deps", ...stillMissing]);
for (const name of stillMissing) await launch(name);
