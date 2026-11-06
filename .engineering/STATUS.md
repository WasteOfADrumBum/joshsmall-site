<!-- generated from .engineering/state.json (revision 9); edit state.json through a checkpoint, not this file -->

# personal-portfolio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Portfolio release 1.0 (November 2026): complete and owner-approved in this repository; project in maintenance
- Active task: Raise CI/CD to an evidence-backed standard (PR #34): browser tests on the production build, CI gate, security scans, production verification
- Branch: `claude/project-thread-zdhgmq`
- Recorded commit: `1063875` on `claude/project-thread-zdhgmq`
- Last checkpoint: 2026-11-06T01:00:00Z by Claude Code

## Next action

Agent: merge PR #34 when the CI gate is green, then verify production serves the merged commit and record it in docs/ci/EVIDENCE.md. Joshua Small: import .github/rulesets/main.json and enable Vercel Deployment Checks for CI gate (docs/ci/README.md).

## Completed

- PR #33 (mobile hero fixes) merged on GitHub; the revision 8 record still listed it as open
- PR #34: Playwright suite on next start (journeys, contact path through the real handler with a local Resend stand-in, axe and WCAG behaviour checks, performance and SEO budgets); Firefox and WebKit for @cross tests
- PR #34: CI gate aggregate job, SHA-pinned actions, actionlint, zizmor, gitleaks, CodeQL, Dependabot with cooldown
- PR #34: production.yml verifies production after each Vercel production deployment, every 6 hours and by hand; failures open a production-check issue; weekly.yml runs the full cross-browser suite, link checks and Lighthouse trends
- PR #34: app fixes found by tests: contact input types and lengths, body byte cap, provider timeout, no-store, Escape focus in the mobile menu, hero Pause pill contrast, X-Build-Commit header
- Independent review agent: 3 material and 11 minor findings; material ones fixed (axe animation wait, deployment_status comment, rename-safe docs-only check)
- docs/ci/README.md (pipeline, local commands, owner settings, rollback, exceptions) and docs/ci/EVIDENCE.md (requirements, evidence, score 81/100)

## In progress

- PR #34 final CI run, then merge and production verification against the merged commit

## Tests (agent-reported)

- `GitHub CI ci.yml on main`: pass at `1435e75`, 2026-11-02T19:00:00Z
- `Production smoke check (production-smoke.yml)`: pass at `1435e75`, 2026-11-02T19:00:00Z
- `GitHub CI ci.yml on main`: pass at `829ffc8`, 2026-11-02T19:11:50Z
- `npm run typecheck && eslint src/components/Hero.tsx && npm test && npm run build`: pass at `26e0854`, 2026-11-03T22:50:00Z
- `Playwright scroll check at 390x844: toggle bottom vs intro top at scroll 0/300/500/700`: pass at `26e0854`, 2026-11-03T22:50:00Z
- `eslint src/components/Hero.tsx && npm run build; Playwright 390x844 pixel sample across hero bottom edge`: pass at `273ad8b`, 2026-11-03T23:00:00Z
- `npm test (67), lint, typecheck, CI=1 playwright test --project=chromium (61 passed, 1 skipped)`: pass at `7ecb257`, 2026-11-06T00:47:00Z

## Unverified changes

- Owner-reported (Joshua Small, 2026-11-02): contact email arrives; reduced motion passes; gradient text passes in light and dark mode; Vercel and Resend on free plans; failure emails enabled
- Owner-reported (Joshua Small, 2026-11-02): screen-reader testing passes and 200% zoom passes; screen reader, browser and OS not stated
- None of the above is a hub verify:record pass; hub gates remain unverified until the verifier records them
- Live production headers present and no X-Powered-By (agent-read through the Vercel connector, 2026-11-02)
- Mobile hero overlap fix checked by the agent in headless Chromium at 390px only; not checked on a real phone
- Firefox and WebKit runs are only verified in GitHub Actions (no WebKit locally)
- Delivery of the production-check issue notification to the owner has not been verified end to end
