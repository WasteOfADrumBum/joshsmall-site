# Roadmap

Future work for onesmall.company after release 1.0. **Nothing here blocks the release.** Release blockers and owner gates live only in [docs/release/ACCEPTANCE.md](docs/release/ACCEPTANCE.md).

Priority: **P1** do next, **P2** worthwhile, **P3** nice to have. No item may add tracking, a paid service or a billing change without the owner's decision.

## Owner settings

### O1. Require CI before merging to `main` (P2)
- **Purpose:** CI runs on every PR, but nothing stops a merge while it is red.
- **Scope:** import `.github/rulesets/main.json` at https://github.com/WasteOfADrumBum/joshsmall-site/settings/rules (New ruleset > Import). It requires pull requests and the **CI gate** check, blocks force pushes and deletion of `main`, and has no bypass list. Steps in `docs/ci/README.md`.
- **Acceptance:** a PR with a failing CI gate cannot be merged; the "Report protection of main" job in Production verification passes.
- **Dependencies:** none.

### O2. Refresh share previews (P3)
- **Purpose:** LinkedIn and Facebook may still cache the old share card from before PR #25.
- **Scope:** run https://onesmall.company through LinkedIn Post Inspector and the Facebook Sharing Debugger.
- **Acceptance:** both show the 1200×630 card with the current title.
- **Dependencies:** none.

### O3. Decide on `www.onesmall.company` (P3)
- **Purpose:** the wildcard DNS record points `www` at Vercel, but it is not a domain on the project, so it most likely shows a Vercel 404.
- **Scope:** add `www.onesmall.company` to the project as a 308 redirect to the apex, or record that it is intentionally unserved.
- **Acceptance:** `https://www.onesmall.company/` redirects to `https://onesmall.company/`, or the decision is written in the release record.
- **Dependencies:** owner approval for a production domain change.

### O4. Confirm Resend key scope (P3)
- **Purpose:** the API does not show whether the "Joshua Small Portfolio" key is limited.
- **Scope:** in Resend, confirm or set the key to "Sending access" for `onesmall.company` only; rotate it in Vercel if it is changed.
- **Acceptance:** key shows sending-only for one domain; one contact send still arrives.
- **Dependencies:** none.

## Reliability and operations

### R1. Global rate limit for the contact form (P2)
- **Purpose:** the current limit is per function instance, so a distributed flood could still reach the Resend daily cap of 100.
- **Scope:** a Vercel WAF rate-limit rule on `POST /api/contact` if the Hobby plan allows one, otherwise a free shared store already in use. No new paid service.
- **Acceptance:** more than 5 posts from one IP in 10 minutes get 429 regardless of instance; normal sends are unaffected; documented in the release record.
- **Dependencies:** owner confirms the plan's WAF limits (see ACCEPTANCE §2).

### R2. Contact delivery alert (P2)
- **Purpose:** the smoke check proves the API answers, not that mail is delivered.
- **Scope:** a Resend webhook for `email.bounced` and `email.failed` that emails the owner, or a weekly manual check of Resend logs, whichever is free.
- **Acceptance:** a forced failure in a preview produces an alert within 10 minutes.
- **Dependencies:** none.

### R3. Longer log retention (P3)
- **Purpose:** Hobby runtime logs last about an hour, which is short for diagnosing a reported failure.
- **Scope:** evaluate free log drains; adopt only if free.
- **Acceptance:** `[contact]` log lines are searchable for at least 7 days.
- **Dependencies:** owner decision on any provider.

## Security

### S1. DMARC for onesmall.company (P1)
- **Purpose:** SPF and DKIM pass, but no DMARC record exists, which lowers deliverability and allows spoofing of the domain.
- **Scope:** add `_dmarc` TXT `v=DMARC1; p=none;`, review reports for a few weeks, then move to `p=quarantine`.
- **Acceptance:** DMARC lookup returns a policy; Resend still shows the domain verified; a test send passes DMARC in Gmail's "Show original".
- **Dependencies:** owner approval to change production DNS.

### S2. Nonce-based CSP (P3)
- **Purpose:** remove `'unsafe-inline'` from `script-src`.
- **Scope:** only if it can be done without making the home page server-rendered on every request.
- **Acceptance:** no CSP violations in a full-page browser run; `/` stays static; Lighthouse performance does not drop.
- **Dependencies:** Next.js support for static pages with nonces or hashes.

### S3. HSTS `includeSubDomains` and preload (P3)
- **Purpose:** stronger HTTPS guarantee for the whole domain.
- **Scope:** only after every `*.onesmall.company` app is confirmed HTTPS-only.
- **Acceptance:** each subdomain checked; header updated; preload submitted.
- **Dependencies:** owners of the ui, cortex, task, photo and studio apps.

### S4. Dependency upkeep (P2)
- **Purpose:** patch and minor updates are waiting (`next` 16.4.4, `react` 19.3.1, `resend`, `motion`, `lucide-react`), and `npm audit` reports a dev-only `minimatch` advisory in the ESLint toolchain.
- **Scope:** take the patch and minor updates; add Dependabot or Renovate for npm and GitHub Actions; move to ESLint 10 when `eslint-config-next` supports it.
- **Acceptance:** CI green after each update; `npm audit` reports 0 advisories; lint output unchanged.
- **Dependencies:** upstream `eslint-config-next` release for the advisory.

## Performance

### P1. Lighter avatar sprite (P2)
- **Purpose:** the 617 KB sprite sheet is two thirds of page weight; full load on a slow connection is 6.7 s.
- **Scope:** recompress or split the sheet, and load it only when the avatar is first shown.
- **Acceptance:** total page weight under 600 KB; animation looks the same; LCP no worse than 2.2 s at 400 kbit/s.
- **Dependencies:** none.

### P2. Smaller share image (P3)
- **Purpose:** `og-image.png` is 467 KB, slow for crawlers fetching previews.
- **Scope:** recompress it, or switch to JPEG, keeping 1200×630.
- **Acceptance:** under 200 KB; LinkedIn Post Inspector shows the card.
- **Dependencies:** none.

## Quality

### Q1. Automated accessibility and browser checks in CI (P2)
- **Purpose:** the axe and keyboard checks for this release were run by hand.
- **Scope:** a Playwright job against `next start` that runs axe at mobile and desktop widths, tabs through the page, checks for hydration errors with and without reduced motion, and exercises the contact form against a mocked API.
- **Acceptance:** CI fails on any axe violation, a focus stop without a visible indicator, a console error, or a wrong contact-form message.
- **Dependencies:** CI workflow (done in release 1.0).

### Q2. Contact route tests (P3)
- **Purpose:** request checks are unit-tested, but the route itself is tested only by hand.
- **Scope:** tests that call `POST` with a mocked Resend client.
- **Acceptance:** each status code (400, 403, 413, 415, 429, 502, 503, 200) covered.
- **Dependencies:** none.

### Q3. Contact success sometimes not shown in Firefox and WebKit (P2)
- **Purpose:** in the weekly full suite (two workers), one contact test per run in Firefox or WebKit sometimes saw the API answer 200 while the form showed neither success nor an error for 12 s. Retries pass, and the required CI subset has not hit it. It may be test load, or a real case where a visitor's message is sent but the form looks stuck.
- **Scope:** download the `weekly-firefox` or `weekly-webkit` artifact of a failing run, read the trace of the failed attempt (network, console, DOM), then fix the cause in the form or the test.
- **Acceptance:** five consecutive weekly runs with no flaky contact test in Firefox or WebKit.
- **Dependencies:** none. Evidence: docs/ci/EVIDENCE.md, "Weekly full suite".

## Content

### C1. Custom 404 page (P3)
- **Purpose:** unknown URLs show the default Next.js page, which inherits the home page's title and canonical, so it renders two `<title>` tags and a canonical pointing at `/`.
- **Scope:** `not-found.tsx` with its own metadata and a link home, using existing styles.
- **Acceptance:** 404 status kept, `noindex` kept, one `<title>`, no canonical to `/`, axe clean.
- **Dependencies:** none.

### C2. README screenshot (P3)
- **Purpose:** the README had a placeholder for a screenshot that never existed.
- **Scope:** add `docs/screenshot.png` of the live site and embed it.
- **Acceptance:** the image renders on GitHub and is under 300 KB.
- **Dependencies:** none.
