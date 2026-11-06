# CI/CD for onesmall.company

How changes are checked, merged, deployed and verified. Evidence for each requirement and the
current score are in [EVIDENCE.md](./EVIDENCE.md).

## The flow

1. A pull request runs **CI** (`.github/workflows/ci.yml`) and **CodeQL** (`codeql.yml`).
2. **CI gate** is the one check that decides whether the change may merge. It passes only if every
   mandatory job succeeded, and allows a skip only for a documentation-only pull request.
3. Merging to `main` makes Vercel build and deploy production (Vercel's Git integration; there is
   no second deployment system).
4. When Vercel reports the production deployment as successful, **Production verification**
   (`production.yml`) waits until https://onesmall.company serves that commit, then runs read-only
   HTTP and browser checks. It also runs every six hours and by hand.
5. Once a week, **Weekly deep checks** (`weekly.yml`) run the full browser suite in Firefox and
   WebKit, check outbound links and record Lighthouse medians as a trend.

## CI jobs

| Job | What it runs | Typical time |
| --- | --- | --- |
| Detect change type | Decides whether the change touches anything except Markdown, `docs/` and `.engineering/` | ~5 s |
| Static checks, unit tests, build and Chromium browser tests | format check, lint, typecheck, unit tests, `npm audit`, production build, all Playwright tests in Chromium against `next start` | ~3 min |
| Firefox and WebKit browser tests | Same build, tests tagged `@cross` | ~2–3 min, in parallel |
| Workflow lint, workflow security and secret scan | actionlint (with shellcheck), zizmor, gitleaks over the full history | ~15 s |
| **CI gate** | Checks the results above | ~5 s |

Every browser job uploads the Playwright HTML report and, for failed tests, traces and screenshots, plus `test-results/server.log` and
`test-results/environment.json` (commit, Node, Playwright and runner versions) for seven days.

## Run the checks locally

```bash
npm ci
npm run format:check   # Prettier, for the test, script and workflow files (see "Formatting")
npm run lint
npm run typecheck
npm test               # unit tests (Node test runner)
npm run build
npx playwright install chromium   # once; add firefox webkit for the cross-browser run
npm run test:e2e       # Chromium, against the production build
npm run test:e2e:cross # Firefox and WebKit, tests tagged @cross
npm run smoke          # read-only checks of the live site (needs internet access)
npm run test:prod      # read-only browser checks of the live site
npm run links          # outbound link check
```

`npm run test:e2e` starts two local processes on 127.0.0.1: the production server on port 3100
and a stand-in for the Resend API on 3101 (`E2E_PORT` and `MOCK_RESEND_PORT` change them). It
fails at once if the port is taken, if there is no build, or if either process exits.

## Email in tests

The contact tests send real requests through the real `/api/contact` handler and the real Resend
SDK. The SDK reads `RESEND_BASE_URL`, which the test server points at
`e2e/support/mock-resend.mjs`. Nothing leaves the machine, no real key is used
(`re_test_e2e_not_a_secret`), and the application has no test-only code path.

- The stand-in "accepting" a message proves the handler built and handed it off correctly. It is
  **not** proof of inbox delivery. Real delivery was last confirmed by the owner on 2026-11-02
  (see `docs/release/ACCEPTANCE.md`).
- Production checks only send invalid requests, which the handler refuses before the provider.
- Never set `RESEND_BASE_URL` in Vercel. If it were set, contact messages would go to that address.

## Protect `main` (owner action)

The repository is public, so rulesets are available on the free plan. Import the committed ruleset:

1. Open https://github.com/WasteOfADrumBum/joshsmall-site/settings/rules
2. **New ruleset → Import a ruleset**, choose `.github/rulesets/main.json`, then **Create**.

It requires a pull request (no approval count, so you can merge your own), requires **CI gate**
with the branch up to date, blocks force pushes and deletion, and has no bypass list. Merge queues
are not offered for repositories owned by a personal account; `ci.yml` already listens for
`merge_group` in case that changes. The six-hourly run of `production.yml` reports whether these
rules are in place ("Report protection of main"). That is detection only; it cannot stop a merge.

## Gate production on CI in Vercel (owner action)

Branch protection means only changes that passed CI reach `main`. To also stop Vercel serving a
`main` commit before its own CI run passes, turn on Deployment Checks:

1. Vercel → project **joshsmall-portfolio** → **Settings → Deployment Checks**.
2. **Add checks**, choose GitHub, select **CI gate**, save.

Per Vercel's documentation, production deployments are then built but not assigned to the domain
until the selected checks succeed for that commit, so a failed or cancelled check leaves the
previous deployment live. Confirm this the first time by watching one deployment wait for CI.

## Production verification and notifications

`scripts/smoke.mjs` and `e2e/prod/smoke.spec.ts` check a fixed URL; nothing from the deployment
event is used as a URL. The deployment SHA from the event must be a full SHA on `main`, and the
check scripts come from `main`. If a newer deployment replaces the expected one while the check
waits, a served commit that already contains the expected one passes with a note.

GitHub reads the workflow file itself from the deployed commit on `deployment_status`, so any branch
Vercel deploys can bring its own workflow. Keep **Vercel > Settings > Git > Git Fork Protection**
on, so pull requests from forks are never deployed (and never trigger workflows) without your
approval. This applies to any workflow listening to `deployment_status`, not just this one. Each failure is labelled **functional** (wrong answer), **network** (no
answer after retries) or **blocked** (an earlier check failed).

On failure the workflow opens one issue labelled `production-check`, or comments on the open one.
GitHub notifies people watching the repository about new issues (owners watch their own
repositories by default, but this depends on your notification settings). For scheduled runs,
GitHub also emails whoever last changed the schedule. Delivery of these notifications has not been
tested end to end; see EVIDENCE.md. A dry run is available:
**Run workflow** with `notify_dry_run` ticked and a bad `expect_sha` prints the issue it would open.

## Roll back

- **Fastest:** Vercel → project → **Deployments**, open the last good production deployment,
  **⋯ → Instant Rollback** (on the Hobby plan only the previous production deployment can be
restored this way). This changes no code; the next merge to `main` deploys normally again.
- **In code:** `git revert <merge-sha>` on a branch, open a pull request, merge when CI gate passes.
- After either, run **Production verification** by hand (optionally with `expect_sha`).
- To undo only the CI changes, revert the merge of the CI pull request; the site itself only gained
  the fixes listed in EVIDENCE.md and the `X-Build-Commit` header.

## Flaky tests

CI retries a failed test once to capture a trace, and `failOnFlakyTests` still fails the run, so a
test that passes only on retry is reported, not hidden. Fix the cause (usually waiting on an
animation or scroll) rather than adding retries or timeouts.

## Formatting

Prettier checks only `e2e/`, `scripts/`, the Playwright configs and `.github/`. Formatting `src/`
would rewrite 20 files without changing behaviour, so it was left out to keep this change reviewable.
ESLint still covers all source.

## Exceptions

| Exception | Scope | Why | Owner | Review by |
| --- | --- | --- | --- | --- |
| `npm audit` gate for dev dependencies is `high`, not `moderate` | `minimatch` (GHSA-g3hv-75wg-m249, moderate) inside `typescript-eslint`, lint only | Only repository-authored patterns reach it; the fix needs a major `eslint-config-next` change. Already accepted as a known limit on 2026-11-02 | Joshua Small | 2027-02-01 or the next `eslint-config-next` release |
| CSP keeps `'unsafe-inline'` for scripts and styles | Whole site | The home page is static; nonces would force per-request rendering. Tracked as ROADMAP S2 | Joshua Small | ROADMAP S2 |
| Prettier scope excludes `src/` | Formatting only | Avoids unrelated churn; ESLint covers `src/` | Joshua Small | Next refactor |
| WebKit browser tests strip `Strict-Transport-Security` and the CSP `upgrade-insecure-requests` directive | WebKit against the local `http://` test server only (`webkitLoopbackHttp` in `e2e/support/fixtures.ts`) | WebKit upgrades later requests to `https://127.0.0.1` after seeing them, which a local test server cannot serve. Both only matter over HTTPS; the rest of the CSP stays enforced in WebKit, Chromium and Firefox get the headers unchanged, and the deployed headers are checked after every production deploy | Joshua Small | If the tests move to an HTTPS test server |
| Chromium CI job skips the optional fallback-font packages from `install-deps` | `ci.yml` Chromium job, only when a real Chromium launch succeeds with the runner's libraries | The fonts cover CJK, Thai and Unicode text that the site never renders. It self-hosts its fonts. They come from a slow apt pocket that stalled the job twice. If the launch fails, the full `install-deps` still runs | Joshua Small | If tests add content in those scripts, or screenshots compare fonts |
| Browser jobs run on `ubuntu-24.04`, not `ubuntu-latest` | Chromium, Firefox/WebKit, production verification, weekly suite and Lighthouse jobs | On `ubuntu-latest` (26.04), apt served the browser packages at about 50 KB/s and timed out three CI runs on 2026-11-06. 24.04 is a platform Playwright supports | Joshua Small | When Playwright supports 26.04 and its mirror is reliable |
