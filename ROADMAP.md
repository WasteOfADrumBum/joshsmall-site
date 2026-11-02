# Roadmap

Future work for onesmall.company after release 1.0. **Nothing here blocks the release.** Release blockers and owner gates live only in [docs/release/ACCEPTANCE.md](docs/release/ACCEPTANCE.md).

Priority: **P1** do next, **P2** worthwhile, **P3** nice to have. No item may add tracking, a paid service or a billing change without the owner's decision.

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

### S4. Clear the dev-only `minimatch` advisory (P3)
- **Purpose:** `npm audit` reports a moderate advisory in the ESLint toolchain.
- **Scope:** update ESLint and `eslint-config-next` when a non-breaking fix exists.
- **Acceptance:** `npm audit` reports 0 advisories; lint output unchanged.
- **Dependencies:** upstream release.

## Performance

### P1. Lighter avatar sprite (P2)
- **Purpose:** the 617 KB sprite sheet is two thirds of page weight; full load on a slow connection is 6.7 s.
- **Scope:** recompress or split the sheet, and load it only when the avatar is first shown.
- **Acceptance:** total page weight under 600 KB; animation looks the same; LCP no worse than 2.2 s at 400 kbit/s.
- **Dependencies:** none.

## Quality

### Q1. Automated accessibility and browser checks in CI (P2)
- **Purpose:** the axe and keyboard checks for this release were run by hand.
- **Scope:** a Playwright job that builds the site, runs axe at mobile and desktop widths, and tabs through the page.
- **Acceptance:** CI fails on any axe violation or a focus stop without a visible indicator.
- **Dependencies:** CI workflow (done in release 1.0).

### Q2. Contact route tests (P3)
- **Purpose:** request checks are unit-tested, but the route itself is tested only by hand.
- **Scope:** tests that call `POST` with a mocked Resend client.
- **Acceptance:** each status code (400, 403, 413, 415, 429, 502, 503, 200) covered.
- **Dependencies:** none.

## Content

### C1. Custom 404 page (P3)
- **Purpose:** unknown URLs show the default Next.js page instead of the site's look.
- **Scope:** `not-found.tsx` with a link home, using existing styles.
- **Acceptance:** 404 status kept, `noindex` kept, axe clean.
- **Dependencies:** none.

### C2. README screenshot (P3)
- **Purpose:** the README had a placeholder for a screenshot that never existed.
- **Scope:** add `docs/screenshot.png` of the live site and embed it.
- **Acceptance:** the image renders on GitHub and is under 300 KB.
- **Dependencies:** none.
