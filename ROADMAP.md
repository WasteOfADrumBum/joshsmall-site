# Portfolio roadmap

Optional future work. **Nothing here blocks or reopens the current release.** The current release is defined in [docs/release-scope-1.0.0.md](docs/release-scope-1.0.0.md); its gates and status live in the [One Small Engineering hub](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/projects/registry.json). After acceptance the site moves to maintenance: defects and security fixes only, until the owner starts a new scoped release with items from this list.

Priority: **P1** next, **P2** useful, **P3** nice to have.

## E1. README screenshot (P3)

- **Purpose:** show the site at a glance on GitHub.
- **Scope:** add `docs/screenshot.png` (desktop, light content only, under 300 KB) and reference it from the README.
- **Acceptance criteria:** image renders on GitHub; alt text describes it; no broken links.
- **Dependencies:** none.

## E2. Project showcase updates (P2)

- **Purpose:** keep the Projects section current as other One Small projects ship.
- **Scope:** content edits in `src/content/site.ts` only; no layout change.
- **Acceptance criteria:** every listed project link resolves; CI green; owner approves the copy.
- **Dependencies:** releases of the projects being featured.

## E3. Automated accessibility check in CI (P2)

- **Purpose:** catch WCAG regressions on PRs, as Studio and OneSmallUI already do.
- **Scope:** a Playwright + axe job against `next start` for the home page in light and dark modes.
- **Acceptance criteria:** 0 serious or critical axe violations; job required on PRs.
- **Dependencies:** none.

## E4. Contact form abuse protection (P3)

- **Purpose:** reduce spam if it appears.
- **Scope:** a honeypot field or a free-tier rate limit on `/api/contact`; no paid service.
- **Acceptance criteria:** honest submissions still arrive; scripted bursts are refused; tests cover both.
- **Dependencies:** evidence of spam (do not build speculatively).

## E5. Dev-only dependency advisories (P3)

- **Purpose:** clear the moderate `minimatch` advisories inside ESLint tooling (dev only; production audit is clean as of 2026-11-02).
- **Scope:** upgrade when upstream ships a fixed range; never `npm audit fix --force`.
- **Acceptance criteria:** `npm audit` 0 moderate or higher; lint unchanged.
- **Dependencies:** upstream eslint ecosystem releases.
