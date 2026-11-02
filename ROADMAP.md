# Roadmap

Optional improvements found during the November 2026 release closeout ([docs/RELEASE.md](docs/RELEASE.md)).
None is required for the current release. Owner-only settings are listed under "Manual checks" in the release
record, not here.

## Reliability and operations

- **Server-side rate limit fallback.** If a Vercel Firewall rule isn't available, add a small limiter for
  `/api/contact` (for example Upstash or Vercel KV keyed by IP). In-memory limits don't hold across serverless
  instances.
- **Contact failure alerting.** Send a Resend webhook (bounced, failed) to a small handler or email, or add an
  uptime monitor, so a broken form is noticed without relying on 1-hour logs.
- **Smoke test in CI.** A Playwright job against `next start` covering hydration (with and without reduced
  motion), the contact form with a mocked API, and the security headers. The closeout ran these by hand.
- **Dependency upkeep.** Patch/minor updates (`next` 16.4.4, `react` 19.3.1, `resend`, `motion`,
  `lucide-react`) and Dependabot or Renovate. ESLint 10 and TypeScript 7 are majors; take them when
  `eslint-config-next` supports them, which also clears the dev-only `minimatch` advisories.

## SEO and content

- **404 page metadata.** The not-found page inherits the home page's title and canonical, so it renders two
  `<title>` tags and a canonical pointing at `/`. A `not-found.tsx` with its own metadata fixes both.
- **README screenshot.** `docs/screenshot.png` is still a TODO.

## Performance

- **Sprite sheet size.** `public/avatar/joshua-sprites.webp` is 600 KB. It already loads after `load` when the
  browser is idle; re-exporting from the source art (noted in PR #22) could cut it and sharpen it.
- **Share image size.** `og-image.png` is 467 KB; a compressed PNG or JPEG would load faster for crawlers.

## Security hardening

- **Nonce-based CSP.** The CSP allows `'unsafe-inline'` scripts so the home page stays static. A nonce or hash
  policy would remove that at the cost of per-request rendering or build-time hashing (see PR #26).
- **HSTS preload.** Add `includeSubDomains; preload` only after every `*.onesmall.company` site is confirmed
  HTTPS-only.
