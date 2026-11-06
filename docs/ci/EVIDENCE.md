# CI/CD evidence record

What was required, what was done, and the evidence for each item. Pipeline description and local
commands are in [README.md](./README.md). Recorded by Claude (agent) for the task "Raise CI/CD to
an evidence-backed standard" (PR #34). Nothing here records an owner verification or approval.

- **Candidate:** branch `claude/project-thread-zdhgmq`, PR
  [#34](https://github.com/WasteOfADrumBum/joshsmall-site/pull/34). The final candidate SHA, CI run,
  merged SHA, deployment and production-verification run are listed in
  [Post-merge verification](#post-merge-verification).
- **Baseline:** `main` at `1eb9c1b` (before this PR).

## 1. Baseline (before this PR)

### The previous audit (61/100), revalidated

| Finding in the previous audit | Checked against `main` before this PR | Result |
| --- | --- | --- |
| Read-only CI permissions, cancellation, a timeout, npm caching, lint, types, tests, build, production `npm audit` | `ci.yml`: `contents: read`, `cancel-in-progress`, 15 min timeout, `cache: npm`, lint/typecheck/test/build, `npm audit --omit=dev --audit-level=high` | Confirmed. Actions were pinned to tags (`@v4`), not SHAs |
| Scheduled production smoke checks (content, headers, redirects, SEO endpoints, contact validation) | `production-smoke.yml` on a schedule, curl-based | Confirmed; kept and extended (now `scripts/smoke.mjs`, still scheduled) |
| CI around 1–1½ minutes | Recent runs: about 83 s on pull requests, 95 s on push; `npm ci` about 55 s of it | Confirmed |
| No browser or component interaction suite | Only `node --test` unit tests for `src/lib` | Confirmed |
| `main` unprotected | Rules API for `main` returned no rules | Confirmed (still true; see §4) |
| No link between CI and production deployment | Vercel deploys every push to `main` regardless of CI | Confirmed (still true until the owner enables Deployment Checks; see §4) |
| Limited diagnostics and static security analysis | No artifacts, no CodeQL, no workflow linting, no secret scanning | Confirmed |

Also found during discovery and fixed in this PR (application fixes are kept to what the tests
exposed):

- The contact handler accepted non-string fields and silently truncated over-long ones. It had no
  byte cap on the body and no timeout on the provider call, and its responses could be cached.
- Escape closed the mobile menu but left focus on a hidden element.
- The hero Pause pill failed contrast over the glow on phones (axe, real defect). It now has a
  translucent backing.
- The site exposed no way to tell which commit production serves. It now sends `X-Build-Commit`.
- Later, during this PR: the first axe wait helper let checks run while the hero was still fading
  in. CI caught it and it was fixed before merge (see §5).

### Baseline timing

| Measure | Before | After (PR #34 final candidate) |
| --- | --- | --- |
| PR wall-clock, push to all checks done | ~83 s (one job) | about 3 min (see [Post-merge verification](#post-merge-verification)) |
| Time to first actionable failure | ~83 s (one serial job) | ~15 s for workflow and secret issues; static checks fail in about 1 min |
| Browser suite | none | Chromium: 62 tests in about 2 min on the runner; Firefox and WebKit run in parallel |
| Duplicate installs/builds | one install, one build | the Chromium job builds once and tests the same build; the cross-browser job builds its own copy in parallel instead of waiting for the Chromium job to hand over its build, which would serialise the two jobs |

## 2. Requirements and evidence

Status is for the final candidate commit unless stated. **PASS** = implemented and seen working in
CI or locally (stated). **BLOCKED** = needs something this session cannot do. **N/A** = does not
apply, with the reason.

### Production-mode browser testing (task §3)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Maintained framework, locked dependencies | PASS | `@playwright/test` 1.63.0 and `@axe-core/playwright` in `package-lock.json`; `playwright-core` deduped to one version |
| Tests run against `next build` + `next start` | PASS | `e2e/support/serve.mjs` runs `next start` from `.next/BUILD_ID` with `NODE_ENV=production`; fails fast with no build |
| Synthetic data, isolated ports, clean lifecycle, clear readiness | PASS | Ports from `E2E_PORT` / `MOCK_RESEND_PORT`; Playwright `webServer` health URLs; `reuseExistingServer: false`; graceful SIGTERM; unexpected server exit fails the run |
| No production secrets, no real email | PASS | Synthetic `re_test_…` key; `RESEND_BASE_URL` points the real SDK at `e2e/support/mock-resend.mjs` on 127.0.0.1; the stand-in rejects any other key |
| No test endpoints or bypasses in the app | PASS | Nothing in `src/` refers to tests, `RESEND_BASE_URL` or a test mode (independent review checked this) |
| Failures propagate | PASS | CI run on `1d56e8b` failed and the gate went red; WebKit and axe failures in later runs did too |
| Build reused, not rebuilt | PASS | One build per job (see timing table) |
| App tests separate from hosting tests | PASS | `playwright.config.ts` ignores `e2e/prod/`; hosting behaviour (redirects, domain, deployed headers) is only checked by `scripts/smoke.mjs` and `e2e/prod/` against production |

### Visitor journeys (task §4)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Home rendering, primary navigation | PASS | `journeys.spec.ts`: every section and footer render; nav scrolls to each section and marks it current |
| Project listing and links | PASS | Every project from `site.ts` listed with its link; side-project links open safely in a new tab |
| Mobile menu: open, keyboard, navigate, close | PASS | Tap flow and keyboard flow; Escape returns focus to the button (app fix) |
| Contact validation and feedback | PASS | `contact-ui.spec.ts` (see next table) |
| Theme or appearance controls | N/A | The site has no theme switch; it follows the system setting. Both system modes are checked by axe |
| Interactive components | PASS | Headline pause/play, portrait photo/cartoon toggle |
| Unknown routes | PASS | Not-found page with 404; unknown API paths 404 |
| Back/forward, direct navigation and refresh | PASS | Back/forward between visited sections; direct `/#section` and reload land on it |
| Page errors, failed first-party assets, hydration errors | PASS | Auto fixture in `e2e/support/fixtures.ts` fails any test on `pageerror`, console error, failed or 4xx/5xx first-party request. No global allowlist; per-test allowances are single regexes with a reason |

### Contact path (task §5)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Valid submission through the real UI and handler | PASS | Browser → `/api/contact` → Resend SDK → local stand-in; the stand-in records exactly one message with the submitted values |
| Empty, malformed, oversized, unexpected input | PASS | UI and `contact-api.spec.ts`; unit tests in `src/lib/contact.test.ts` |
| Invalid JSON, wrong content type or method | PASS | 400, 415, 405 |
| Origin enforcement, size limits | PASS | Cross-site and look-alike origins 403; declared and actual oversize 413 (`readBodyCapped`) |
| Rate limiting and client identification | PASS | Sixth message in ten minutes 429 with `Retry-After`; per-client key from `x-forwarded-for`, which Vercel overwrites |
| Duplicate clicks, concurrent submissions | PASS | Double click sends once; concurrent sends from one client are capped at five per window |
| Provider timeout, rejection, network failure | PASS | Stand-in modes `e2e-reject` (422), `e2e-500`, `e2e-drop` (connection closed), `e2e-slow` (15 s); a provider that never answers is cut off at 10 s |
| Loading state recovery, text kept after failure | PASS | Asserted after each failure mode and after the browser goes offline |
| Accessible success and error feedback | PASS | Status region text and `aria-invalid`/focus on the first invalid field |
| No sensitive data in responses or logs | PASS | Responses checked for submitted values; the server log is checked in tests and in global teardown |
| Accepted vs delivered | Stated | The tests prove the handler hands the message to the provider. Inbox delivery is not tested and is not claimed |
| Production smoke stays validation-only | PASS | `smoke.mjs` and `e2e/prod/` post only invalid bodies to a fixed URL; no email is sent |

### Accessibility (task §6)

| Requirement | Status | Evidence |
| --- | --- | --- |
| axe (WCAG 2.0–2.2 A/AA tags) on every section, both system colour modes, phone, reduced motion | PASS | `a11y.spec.ts`; waits for each section's entrance animation first |
| Mobile menu open, contact errors, failure and success states | PASS | Same file |
| Dialogs or overlays | N/A | The site has none besides the mobile menu |
| Names, labels, headings, landmarks | PASS | One h1, no skipped levels, landmarks present |
| Skip link, keyboard order, visible focus | PASS | Skip link first and visible on focus (Chromium, Firefox); focus indicator on every stop in the first part of the page. Limitation: an element with a resting box-shadow would pass the indicator check |
| Focus movement and restoration | PASS | Contact errors focus the first field; Escape restores menu focus |
| Status/error announcements | PASS | Live status region checked |
| Reduced motion | PASS | Headline stops, no automatic portrait switch, no pinned scroller |
| Reflow at 320 px, text spacing, 200% text | PASS | No horizontal scroll; WCAG text-spacing overrides; doubled base size on desktop |
| Touch targets without hover | PASS | Every control at least 24×24 CSS px (WCAG 2.5.8) |
| Contrast in real states | PASS | Found and fixed the Pause pill; axe runs after animations settle |
| Decorative vs informative images | PASS | Informative images have alt text; decorative ones are hidden |
| Manual checks still needed | Open | Screen-reader output, real browser zoom and visual judgement need a person. The owner's earlier results in `docs/release/ACCEPTANCE.md` §6 were reported for release 1.0 and do not cover changes since |

Zero axe violations is not WCAG conformance.

### Compatibility (task §7)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Chromium on every relevant PR | PASS | Whole suite, required |
| Focused Firefox and WebKit | PASS | Tests tagged `@cross` (journeys, mobile menu, contact, skip link, reflow) in a parallel required job |
| Wider matrix on a schedule | PASS | `weekly.yml` runs the whole suite in Firefox and WebKit |
| Device emulation is not a real device | Stated | Physical phones are not tested |
| Outbound links checked separately | PASS | `scripts/check-links.mjs` weekly: first-party failures fail, third-party failures warn; bounded timeouts and one retry |
| Visual regression | N/A | Not added: the hero is animated and time-based, and pixel snapshots would be noisy for little gain; layout stability and contrast are checked instead |

### Security (task §8)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Actions pinned to full SHAs, updates automated | PASS | Every `uses:` pinned with a version comment; Dependabot for npm and actions with a 7-day cooldown |
| Least privilege, checkout credentials, timeouts | PASS | `permissions: {}` at the top of every workflow, per-job grants; `persist-credentials: false`; job and request timeouts |
| Untrusted metadata, no PR code with deploy credentials | PASS | Event values reach scripts only via `env:`; the deployment SHA must be 40 hex and on `main`; checks use a fixed URL. No workflow uses deployment credentials |
| `deployment_status` caveat | Stated | GitHub reads that workflow file from the deployed commit; Vercel fork protection must stay on (README) |
| No secrets or contact contents in artifacts | PASS | Synthetic data only; server log checked for submitted values |
| Workflow lint and dangerous patterns | PASS | actionlint (with shellcheck) and zizmor in the required security job |
| Secret exposure | PASS | gitleaks over full history in the required job |
| Dependency vulnerabilities incl. build tools | PASS (with exception) | Production deps fail at moderate; all deps fail at high. Exception for one moderate dev-only advisory (README) |
| Static analysis | PASS | CodeQL for JavaScript/TypeScript and Actions on PRs, `main` and weekly. Its first PR findings (two in the check scripts) were fixed |
| XSS and unsafe rendering | PASS | The only `dangerouslySetInnerHTML` is the JSON-LD script; `serializeJsonLd` escapes angle brackets (unit-tested). React escapes everything else |
| Header regressions, canonical host, caching | PASS | Built app: headers on every page type, no `X-Powered-By`; home cacheable, API `no-store`. Production: headers, the `vercel.app` alias redirecting permanently to the canonical domain, canonical URL |
| CSP | PASS (with exception) | No `unsafe-eval`, `frame-ancestors 'none'`. `'unsafe-inline'` remains for scripts and styles (ROADMAP S2) |

### Merge gate (task §9)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Format, lint, types, unit, build, browser, a11y, security, aggregate | PASS | `ci.yml` jobs and the **CI gate** job |
| Gate fails on failure, cancellation, unexpected skip | PASS | Gate went red on the failed runs of this PR |
| Docs-only PRs don't leave checks pending | PASS | Detect change type skips build/browser jobs for Markdown/`docs/`/`.engineering/`, the gate allows exactly that skip; renames count both paths |
| Bound to the candidate revision | PASS | `pull_request` runs on the merge commit; ruleset uses the strict (up-to-date) policy |
| Merge queue | PASS | `merge_group` trigger; everything runs there |
| `main` protected | **BLOCKED** | This session's GitHub access cannot write rulesets. `.github/rulesets/main.json` is ready to import; "Report protection of main" warns on every scheduled run until it exists. Detection is not prevention |

### Deployment (task §10)

| Requirement | Status | Evidence |
| --- | --- | --- |
| How Vercel deploys | Checked | Vercel Git integration, production from `main`, Node 24 (matches CI) |
| Production cannot serve before CI passes | **BLOCKED** | Needs Vercel Deployment Checks (dashboard setting, owner). Until then production can go live before CI finishes on `main`. Steps in README |
| Intended commit verified | PASS | `X-Build-Commit` from `VERCEL_GIT_COMMIT_SHA`; production verification waits for that SHA |
| Preview isolation, protection | Checked | Previews kept; nothing removed or exposed. `robots` blocks non-production hosts (tested) |
| Identical bytes | Not claimed | Vercel builds its own artifact; CI tests its own build of the same commit. The deployed artifact is checked separately after deploy |

### Post-deployment verification (task §11)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Scheduled fallback kept | PASS | Every 6 hours |
| After each successful production deployment | PASS (trigger), see post-merge | `deployment_status` from `vercel[bot]` for Production; preview deployments of this PR were correctly skipped |
| Trusted event and URL | PASS | SHA validated; URL fixed in code |
| Commit, routes, assets, errors, headers, metadata, redirects, contact validation, 404 | PASS | `scripts/smoke.mjs` and `e2e/prod/smoke.spec.ts` |
| Functional vs network failures, bounded retries | PASS | Each failure labelled functional, network or blocked; retries with timeouts |
| Notification | Partly verified | On failure one `production-check` issue is opened or commented on. GitHub's delivery of that issue notification to the owner is not verified |

### Performance and SEO (task §12)

| Requirement | Status | Evidence |
| --- | --- | --- |
| JS/CSS/font/image weight | PASS | First-load budgets: JS 240 KB, CSS 16 KB, fonts 80 KB, images 100 KB (measured about 200/9/45/10 KB); deferred images capped at 650 KB |
| Responsive images | PASS | Portrait uses a source close to its displayed size |
| Layout shift | PASS | CLS while fonts and animations load (Chromium) |
| Third parties | PASS | Nothing loads from other origins |
| Titles, descriptions, canonical, sitemap, robots, structured data, social card | PASS | `perf-seo.spec.ts` and production smoke |
| Lab metrics as trends | PASS | Weekly Lighthouse medians of three runs per form factor, not a gate |

### Speed and diagnostics (task §13)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Parallel jobs, caching | PASS | Security, Chromium and cross-browser jobs run in parallel; npm and Playwright browser caches |
| Retries expose flakiness | PASS | One retry in CI with `failOnFlakyTests` |
| Artifacts | PASS | HTML report, traces/screenshots for failures, server log, environment record; 7-day retention |
| Local scripts | PASS | `npm run test:e2e`, `test:e2e:cross`, `test:prod`, `smoke`, `format:check` |

### Independent review (task §14)

A separate review agent inspected the requirements, the diff and the evidence at `2178df4`. It
reported 3 material and 11 minor findings. Resolved:

1. Material: axe could run mid-animation (flaky contrast failures). Fixed: the wait now covers
   Motion's Web Animations; repeated runs pass.
2. Material: the comment claimed the whole `deployment_status` workflow comes from `main`.
   Corrected, and Vercel fork protection documented as required.
3. Material: a rename into `docs/` could look docs-only. Fixed with `--no-renames`.
4. Minor fixes: Production environment matched by prefix; a newer deployment containing the
   expected commit passes; contact tests seed per attempt so retries report their own result;
   `X-Build-Commit` tested in CI; the production smoke spec compares origins; the CLS test is no
   longer tagged cross-browser.

Kept as they are, with reasons:

- **Duplicate email after a provider timeout.** The visitor may retry a message that Resend
  accepted late. An idempotency key could make a retry after a rejection return the cached
  rejection, which cannot be tested without the real provider. Accepted risk.
- **Two timeout mechanisms.** The SDK abort signal and the outer timeout are both kept. The outer
  one guarantees the response even if a future SDK ignores the signal.
- **Focus check and resting box-shadows.** Listed as a limitation above.
- **zizmor installed with pip without a hash, `npm audit` in the required job.** Accepted
  trade-offs: a new advisory turning CI red is wanted.

## 3. Score

Fixed rubric from the task. Credit is given only for what runs or is enforced, not for
documentation.

| Category | Max | Score | Why not full marks |
| --- | --- | --- | --- |
| Meaningful UI, API and browser validation | 25 | 23 | No inbox-delivery evidence; device emulation only |
| Deployment gating, production verification, recovery | 20 | 13 | Production can still go live before CI (Deployment Checks not enabled); notification delivery unverified |
| Workflow and application security | 20 | 18 | CSP keeps `'unsafe-inline'`; one accepted dev advisory |
| Accessibility, compatibility, performance, SEO | 15 | 13 | Manual screen-reader, zoom and visual checks outstanding; no real devices; one open Firefox/WebKit contact flake in the weekly suite (ROADMAP Q3) |
| Merge enforcement and operational reliability | 10 | 5 | `main` not yet protected (detection only) |
| Speed, diagnostics, maintainability | 10 | 9 | Cross-browser job builds separately |
| **Total** | **100** | **81** | |

All work that this session could implement is done. 100/100 is not achieved. The two owner
settings (ruleset import and Vercel Deployment Checks) would raise the score to about 89: about 5
points for merge enforcement and about 3 for deployment gating. The rest needs manual checks and
real-device testing. This score rates CI/CD maturity. It does not certify the absence of defects
or full accessibility conformance.

## 4. Owner actions

1. **Protect `main`:** Settings → Rules → Rulesets → New ruleset → Import →
   `.github/rulesets/main.json`.
2. **Gate production on CI:** Vercel → project → Settings → Deployment Checks → add **CI gate**
   from GitHub.
3. Keep **Git Fork Protection** on in Vercel.

## 5. Notes from this PR's CI runs

- `5f42f93`: actionlint (shellcheck SC2016) failed in the security job. The gate was red. Fixed in
  `1d56e8b`.
- `1d56e8b`: CodeQL found incomplete escaping in `smoke.mjs` and network data written to a file in
  `check-links.mjs`. WebKit fetched assets over `https://127.0.0.1` because of the HSTS/CSP upgrade.
  The axe contrast check ran mid-fade on the hero buttons. All three were fixed in later commits.

## Post-merge verification

PR #34 merged at 2026-11-06 05:27 UTC as merge commit `31724b15b9c6bbe62bb1f159829823d18983dd8d`,
after every check passed on its head `c29f096`
([CI run](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42142405076)).

| Check | Result | Link |
| --- | --- | --- |
| Vercel production deployment of `31724b1` | Created 05:27:46 UTC | GitHub deployment `7593150179` |
| Production verification from the `deployment_status` event | PASS at 05:28:36: production served `31724b15b9c6`, 8/8 HTTP checks, 6/6 browser checks (desktop and phone) | [run 42168559834](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42168559834) |
| CodeQL on `main` | PASS | [run 42168525197](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42168525197) |
| CI on `main` (push) | FAIL: infrastructure. Security, Firefox and WebKit passed. The Chromium job timed out in "Install browser system dependencies", so no tests ran | [run 42168525354](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42168525354) |
| Notification path (`notify_dry_run`, impossible expected commit) | PASS: verification refused the commit ("not on main") and failed. The notify job printed the issue it would open, and no issue was created. The protection report warned that `main` is not protected (expected until owner action 1) | [run 42169367974](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42169367974) |
| Weekly deep checks, run by hand | Links and Lighthouse PASS. The full Firefox and WebKit suites found real problems, fixed in PR #40. One flaky contact test remains (see below) | [first run on `main`](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42169371336), [latest on PR #40](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/42173298654) |

**The push failure.** apt fetched package lists at 14.7 MB/s, but the nine optional font packages
Chromium's `install-deps` adds came at about 50 KB/s. It reached the fourth of them before the
5-minute limit. The same thing happened on `c29f096` before a rerun passed. The runner image already
has Chromium's libraries, and the site self-hosts its fonts. The follow-up PR therefore tries a real
Chromium launch first and installs the full set only if the launch fails.

### Weekly full suite (first runs)

The weekly suite runs every test in Firefox and WebKit, not only the `@cross` subset. Its first
runs found:

1. **A real flicker in the scroll reveal (fixed).** `Reveal` measured visibility on the element it
   animates. An element near the 20% threshold at a viewport edge slid itself out of view, slid
   back, and never stopped. It happens in every engine. Chromium's axe wait missed it because
   its fades run as Web Animations and the inline style held a steady value. Visibility is now
   measured on a box that does not move. After the fix, the axe sweeps pass in both engines.
2. **A race in the rate-limit test (fixed).** It waited on success text that was already on screen
   from the previous send, so a later fill could race the form reset. Each send now waits for its
   own response.
3. **One remaining flake (open, ROADMAP Q3).** In each run, one Firefox or WebKit contact test
   sometimes saw `/api/contact` answer 200 while the form showed nothing for 12 s. The retry passed.
   The required `@cross` subset has not hit it on any PR run. The traces are in that run's artifact.
   `failOnFlakyTests` keeps the weekly run red until this is fixed.

The contact success assertions now wait 12 s, which covers the handler's 10 s provider limit.

**Deployment gating.** Production served `31724b1` while CI on `main` was still running. That is
the gap Vercel Deployment Checks closes (owner action 2).

### Timing on the final candidate

| Measure | Before | After |
| --- | --- | --- |
| PR wall-clock, start to CI gate (clean run) | ~83 s, no browser tests | about 3 min: detection 6 s, then the Chromium job (2 min 44 s) in parallel with security (9 s) and Firefox + WebKit (1 min 39 s), then the gate (3 s). Queueing adds up to about 1½ min |
| Merge to production verified | not measured; checks every 6 hours | about 1 min 15 s (deploy event 05:27:46, verified 05:28:36) |
