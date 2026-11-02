# Release record: portfolio release 1.0 (November 2026)

Status: **ready for owner acceptance, not yet approved.** Release approval belongs to Joshua Small and is recorded only in [ACCEPTANCE.md](./ACCEPTANCE.md).

Prepared 2026-11-02 by an AI agent (Claude Code). Everything below marked *agent-verified* was run or read by the agent on that date. Nothing here is independent or human verification unless it says *owner-reported*.

## 1. Scope

The release is the single-page portfolio at https://onesmall.company as it exists on `main`, plus the release-closure changes in the release PR. No redesign and no new product features.

In scope:

- Home page sections in this order: Hero, Why It Matters, About, Projects, Skills, Human Side of AI, Experience That Connects, How I Build, Beyond the Code, Contact.
- Contact form (`/api/contact`) delivering to the owner's inbox through Resend.
- SEO and sharing metadata, `robots.txt`, `sitemap.xml`, icons, Person/WebSite JSON-LD.
- Security headers, the redirect from `joshsmall-portfolio.vercel.app` to the custom domain.

Release-closure changes (release PR):

| Change | Why |
| --- | --- |
| `.github/workflows/ci.yml`: lint, typecheck, unit tests, production build, `npm audit --omit=dev --audit-level=high` on every PR and push to `main` | There was no CI. |
| `.github/workflows/production-smoke.yml`: every 6 hours, checks the live page, headers, robots, sitemap, the Vercel-alias redirect and that `/api/contact` answers (validation only, sends nothing) | There was no uptime check or failure alert. A failed run emails the owner through GitHub. |
| `/api/contact`: same-origin check, JSON-only, 16 KB body cap, best-effort per-client limit of 5 sends per 10 minutes, `try/catch` around the send | The honeypot was the only abuse protection, so one script could fill the inbox and use the Resend daily quota (100). An SDK or network exception returned an unhandled 500. |
| Contact form: plain-language message when the request never reaches the server | The browser's "Failed to fetch" was shown to visitors. |
| Privacy note above the contact form's submit button | The form collects name, email and message and there was no disclosure. |
| `poweredByHeader: false` | Stops advertising the framework. |
| `.env.example`: placeholder recipient instead of the owner's personal address | The public repo listed the personal inbox the site is meant to hide. |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | `tsc --noEmit` alone fails on a clean checkout because `LayoutProps` is generated. |
| README: removed the broken screenshot embed, linked CI, roadmap and this record | |

## 2. Production identity

*Agent-verified through the Vercel and Resend connectors on 2026-11-02.*

| Item | Value |
| --- | --- |
| Repository | `WasteOfADrumBum/joshsmall-site`, branch `main` |
| Production commit before this release | `5f0a849` (PR #27) |
| Vercel team / project | `task-forge3` / `joshsmall-portfolio` (`prj_VRXHTwxWZYMV0yNdhikFluAl34hg`), Node 24.x |
| Current production deployment | `dpl_2oMid2nGeu1LXQjSG9Cv1KwvAK3Y`, READY, built from `5f0a849` |
| Previous production deployment (rollback target) | `dpl_BV7JWLYfGWos6RzAkFGkTFp5ix97`, built from `64f42fc` (PR #26) |
| Domains | `onesmall.company` (verified, production); `joshsmall-portfolio.vercel.app` → 308 to `https://onesmall.company` |
| DNS | Vercel DNS. CAA allows `letsencrypt.org`, `sectigo.com`, `pki.goog` |
| Deployment protection | Vercel Authentication on all deployments except custom domains (previews are private) |
| Environment variables | `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (production, sensitive); `CONTACT_FROM_EMAIL` (production + preview). Values not read. |
| Email provider | Resend, domain `onesmall.company`, sending from `contact@onesmall.company` |

The release commit and deployment ID are filled in on [ACCEPTANCE.md](./ACCEPTANCE.md) after merge.

## 3. Evidence

### Build and tests (agent-verified, local, Node 22)

- `npm ci` then `npm test`: 59 tests pass, 0 fail (51 before this release plus 8 new for the contact guard).
- `npm run lint`: clean. `npm run typecheck`: clean from a clean checkout. `npm run build`: succeeds, `/` is static with daily revalidation, `/api/contact` dynamic.
- `npm audit --omit=dev`: 0 vulnerabilities. Full `npm audit`: moderate `minimatch` advisory (GHSA-g3hv-75wg-m249) in ESLint's dev-only dependency tree, no non-breaking fix. Not shipped to production. Tracked in [ROADMAP.md](../../ROADMAP.md).
- CI on GitHub (agent-read from the PR checks): "Lint, typecheck, test and build" passed on PR #28, commit `12e3504` ([run 41487445853](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/41487445853)). The preview deployment of that commit serves the same security headers and no `X-Powered-By`.

### Contact form

- **Owner-reported (Joshua Small, 2026-11-02):** contact emails arrive successfully.
- Resend (agent-verified): domain `onesmall.company` verified; DKIM, SPF (TXT and MX on `send.`) and return-path CNAME all verified. Open and click tracking off. Usage this period: 5 of 3,000 monthly, 0 of 100 daily.
- Local production build (agent-verified, `next start`, no Resend credentials): cross-origin POST → 403; form-encoded POST → 415; 20 KB body → 413; JSON array → 400; empty fields → 400 with per-field errors; honeypot → 200 without sending; valid message without credentials → 503; sixth valid message from one address in 10 minutes → 429 with `Retry-After`.
- Browser (agent-verified, Playwright Chromium, local build): offline submit shows "Couldn't reach the server. Check your connection and try again."; server errors show the server's message; privacy note renders.
- Logging (agent-verified by reading the code): logs contain only env-presence booleans, Resend's error name and message, the exception type, and a rate-limit notice. Never the visitor's name, email, message or IP.
- No real send was made by the agent. Because the request checks in front of the send changed, one real send after deploy is on the owner checklist.

### Security

- Secret scan (agent-verified): all 76 commits on all refs searched for Resend, Stripe, AWS, GitHub, Slack, Vercel and Google key patterns, private-key blocks, and `KEY/TOKEN/SECRET/PASSWORD=` assignments. No secrets found. The only env file ever committed is `.env.example`.
- Personal data in history: earlier commits of `.env.example` contain the owner's personal email. History was not rewritten (out of scope and against the release rules). The current tree uses a placeholder.
- Production headers (agent-verified, live `onesmall.company`): CSP (self only, `frame-ancestors 'none'`, `upgrade-insecure-requests`), HSTS `max-age=63072000`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. `X-Powered-By: Next.js` was present and is removed by this release.
- Existing audits reconciled: XSS audit (PR #26) found no exploitable XSS and added the headers above; no regression found. HSTS has no `includeSubDomains`/`preload` because the other subdomains are separate apps; see ROADMAP.

### Domain, TLS, caching, images (agent-verified, live)

- `https://onesmall.company/` 200 over HTTPS with HSTS. Certificate issuance is managed by Vercel; the certificate's expiry date was not readable from this environment.
- `/` served from the Vercel cache (`x-vercel-cache: HIT`, `x-nextjs-prerender: 1`); HTML `cache-control: public, max-age=0, must-revalidate`, so a deploy shows up at once.
- Unknown paths return 404 with `noindex`.
- Image optimization works: `/_next/image?url=/joshua-portrait.webp&w=640` → 200 `image/jpeg` 31.6 KB from a 164 KB source, cached, sandboxed CSP.

### Slow network (agent-verified, local production build, Playwright with CDP throttling 400 kbit/s and 400 ms latency, 390×844)

- Heading in the DOM at 2.2 s, Largest Contentful Paint 2.2 s, full load 6.7 s, 913 KB total.
- Unthrottled: LCP 0.37 s. The 617 KB avatar sprite sheet is the largest asset; see ROADMAP.

### Accessibility (agent-verified, local production build)

- axe-core 4.10.3, WCAG 2.0/2.1/2.2 A and AA rules, reduced motion, after scrolling the whole page: **0 violations** at 1440×900 dark, 390×844 dark and 1440×900 light. No horizontal scroll at either width.
- axe could not decide colour contrast for 15 to 20 elements (gradient text and translucent backgrounds). That is missing evidence, not a confirmed defect, and is a manual check on the acceptance record.
- Keyboard: 68 tab stops from "Skip to content" to "Send message", every one with a visible focus indicator.
- Earlier report (Experience section, PR #15) noted that no axe or contrast audit had been run; the axe part is now done.

### Content and SEO

- SEO audit (PR #25): title, description, canonical, Open Graph/Twitter tags, share card, icons, JSON-LD, robots and sitemap. Re-checked live today: robots and sitemap correct, canonical `https://onesmall.company`, share image 1200×630 PNG.
- Content rules from the owner (employer-safe copy, no invented dates or credentials, no age shown) were not re-audited line by line in this release; the release changes add only the privacy note.

### Monitoring, notifications, rollback

- Vercel runtime errors, last 7 days: none (agent-verified).
- No log drains (agent-verified). Hobby-plan runtime logs keep roughly one hour.
- Firewall: no custom rules, platform defaults only (agent-verified: no project firewall config).
- New: scheduled GitHub smoke check every 6 hours. A failed run is the failure alert (GitHub emails the person who last edited the schedule if Actions failure notifications are on).
- Vercel deployment-failure email notifications: account setting, not readable through the connector. Owner check.
- Rollback: Vercel Instant Rollback to the previous production deployment. Dashboard: https://vercel.com/task-forge3/joshsmall-portfolio/deployments → previous production deployment → "Instant Rollback". CLI: `vercel rollback <deployment-url> --scope task-forge3`. Code-level rollback: revert the release merge commit on `main`, which redeploys.

### Providers: billing and email authentication

- Vercel: the billing-charges API returned "costs not found" for October 2026, which fits a Hobby team with no metered charges. The plan name and any spend limit are **not readable** through the connector. Owner check.
- Resend: usage limits observed are 100 emails a day and 3,000 a month, the free-tier caps. The plan name and billing settings are **not readable** through the connector. Owner check.
- Email authentication: SPF and DKIM pass Resend verification. **No DMARC record** exists for `onesmall.company` (`_dmarc` TXT is absent from Vercel DNS). Not a release blocker at this volume, but recommended; the exact record is on the owner checklist.

### Privacy (agent-verified by reading the code and live responses)

- Collected: name, email and message, only when a visitor submits the form. Sent by email to the owner through Resend. Not stored by the site.
- Cookies: none set by the site. No `Set-Cookie` on the page responses checked. No `localStorage` or `sessionStorage`.
- Third parties loaded by the page: none. Fonts are self-hosted by `next/font`; the CSP allows only `'self'`. External links (LinkedIn, GitHub, project subdomains) load nothing until clicked.
- Processors: Vercel (hosting, short-lived request logs), Resend (email delivery). Disclosed in the note next to the form.

## 4. Release blockers

None confirmed in code. The release is **not complete** until the owner gates in [ACCEPTANCE.md](./ACCEPTANCE.md) are done: CI green on the release PR, merge, production deploy of the merge, one real contact send after deploy, the manual contrast check, provider-setting confirmations, and the owner's approval.

## 5. Not in this release

Everything optional is in [ROADMAP.md](../../ROADMAP.md).
