# Acceptance record: portfolio release 1.0 (November 2026)

Owner and release approver: **Joshua Small**. Only the owner approves. Owner-reported results are recorded as the owner gave them and marked *owner-reported*; the agent did not verify them. Section 5 is signed only by the owner. Evidence for every line is in the [release record](./2026-11-portfolio-release.md).

## 1. Agent-recorded state (2026-11-02)

- [x] Release scope recorded (release record, section 1)
- [x] Production identity recorded (release record, section 2)
- [x] Local lint, typecheck, 60 unit tests, production build on #28 merged with `main` (which includes #29): pass (agent-run)
- [x] Production dependencies: 0 npm advisories (agent-run)
- [x] Secret scan of working tree and all 76 commits: none found (agent-run)
- [x] Live headers, redirect, caching, image optimization, 404: checked (agent-run)
- [x] axe WCAG A/AA: 0 violations at three viewport/theme combinations (agent-run)
- [x] Slow-network run: LCP 2.2 s at 400 kbit/s (agent-run)
- [x] Reduced motion: no console errors on or off; contact form messages for network error, timeout, HTML 500, 502 and success (agent-run, API mocked)
- [x] CI green on the final head of PR #28 (`b9f8af1`, [run 41496107751](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/41496107751)) and on `main` after the merge (`1435e75`, [run 41499128342](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/41499128342)) (agent-read)
- [x] GitHub shows PR #29 merged to `main` by WasteOfADrumBum on 2026-11-02; its production deployment `dpl_ugrywgJJR6jxZds1tcNP7mGFyJzQ` is READY (agent-read)

Owner-reported evidence:

- **Joshua Small, 2026-11-02:** contact emails arrive successfully (before this release's contact-route changes).

## 2. Owner gates (required for release)

- [x] PR #28 merged to `main` by WasteOfADrumBum on 2026-11-02 as `1435e75` (agent-read from GitHub)
- [x] Production deployment of the merge commit is READY on Vercel. Commit: `1435e75` Deployment: `dpl_H2W4sexCyyGjyUhDuEdMHW1hYjee`. Live security headers present, no `X-Powered-By` (agent-read)
- [x] One real message sent from https://onesmall.company/#contact after that deploy arrives in the inbox (*owner-reported, Joshua Small, 2026-11-02*: "Contact email arrives.")
- [x] Home page checked with reduced motion on (*owner-reported, Joshua Small, 2026-11-02*: "Reduced-motion behavior passes.")
- [x] Privacy note wording next to the contact form approved (*owner decision, Joshua Small, 2026-11-02*: "I approve the contact form privacy note and accept the three documented limits")
- [x] Manual contrast check of gradient text passes in light and dark mode (*owner-reported, Joshua Small, 2026-11-02*: "Gradient text passes in light and dark mode.")
- [x] Screen-reader test of the home page passes (*owner-reported, Joshua Small, 2026-11-02*: screen-reader and 200% zoom checks "are tested and confirmed"). Screen reader, browser and operating system: not stated
- [x] Home page usable at 200% browser zoom (*owner-reported, Joshua Small, 2026-11-02*, same statement). Browser and viewport: not stated
- [x] Vercel plan confirmed free (Hobby) (*owner-reported, Joshua Small, 2026-11-02*: "Vercel and Resend use free plans.")
- [x] Resend plan confirmed free (*owner-reported, Joshua Small, 2026-11-02*, same statement)
- [x] Vercel deployment-failure email notifications on (*owner-reported, Joshua Small, 2026-11-02*: "Vercel deployment-failure and GitHub Actions failure emails are enabled.")
- [x] GitHub Actions failure notifications on (*owner-reported, Joshua Small, 2026-11-02*, same statement), and the "Production smoke check" run by hand and green: [run 41499238148](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/41499238148) on `1435e75`, triggered by WasteOfADrumBum, conclusion success (owner-reported, and agent-read from GitHub)

## 3. Optional follow-ups

Moved to [ROADMAP.md](../../ROADMAP.md): DMARC (S1), required CI check on `main` (O1), share-preview refresh (O2), `www` redirect (O3) and Resend key scope (O4). None blocks this release.

## 4. Known limits accepted (*owner decision, Joshua Small, 2026-11-02*: "I approve the contact form privacy note and accept the three documented limits")

- [x] Accepted: rate limiting is per function instance (best effort), not global
- [x] Accepted: the owner's personal email (old `.env.example`) and a full birth date (commits before PR #16) remain in git history; history is not rewritten
- [x] Accepted: dev-only `minimatch` advisory in the ESLint toolchain until ESLint ships a fix

## 5. Approval

Decision: ☒ Approved for release ☐ Not approved

Name: Joshua Small  Date: 2026-11-02

Recorded at the owner's direction from his message of 2026-11-02 19:06 UTC: "I approve the contact form privacy note and accept the three documented limits: per-instance rate limiting, personal data remaining in git history, and the dev-only minimatch advisory. Record this as my approval in ACCEPTANCE.md section 5."

All mandatory gates in section 2 are met. Optional work continues in [ROADMAP.md](../../ROADMAP.md).

## 6. Evidence by Engineering Hub gate

The One Small Engineering hub tracks ten Showcase gates for this project in its registry (`projects/registry.json`, project `personal-portfolio`). This table maps the evidence above to them. *Agent-run* is builder evidence and *owner-reported* is the owner's statement as given. Under the hub's rules neither is a hub verification: a hub gate is verified only when the assigned verifier (Joshua Small) records his own pass with `verify:record`, and the hub shows approval only after that.

| Hub gate | Evidence in this record |
| --- | --- |
| `scope-complete` | Scope in the release record, section 1; release approved by the owner (section 5) |
| `automated-checks` | CI green on `main` at `1435e75` and `829ffc8` (agent-read) |
| `security-privacy-review` | Security, secret, dependency and privacy review (release record, section 3; agent-run); privacy note approved and known limits accepted (owner decision, sections 2, 4 and 5) |
| `wcag-22-aa` | axe WCAG A/AA, 0 violations (agent-run); gradient-text contrast and reduced motion pass (owner-reported) |
| `keyboard-screen-reader` | Keyboard: 68 tab stops, each with a visible focus indicator (agent-run); screen reader passes (owner-reported; screen reader not stated) |
| `responsive-layouts` | 390×844 and 1440×900, no horizontal scroll (agent-run); 200% zoom passes (owner-reported; browser not stated) |
| `critical-workflows` | Contact email arrives (owner-reported); smoke run 41499238148 green; contact-route status codes checked locally (agent-run) |
| `production-deployment` | `1435e75` served as `dpl_H2W4sexCyyGjyUhDuEdMHW1hYjee`, headers checked live (agent-read) |
| `documentation-accurate` | README, release record and this acceptance record on `main` |
| `no-release-blockers` | None open in this repository (release record, section 4) |
