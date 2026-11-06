<!-- generated from .engineering/state.json (revision 10); edit state.json through a checkpoint, not this file -->

# personal-portfolio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Portfolio release 1.0 (November 2026): complete and owner-approved in this repository; project in maintenance
- Active task: Follow-up PR #40: stop the Chromium CI job stalling on optional apt font packages; record post-merge evidence for PR #34
- Branch: `claude/project-thread-zdhgmq`
- Recorded commit: `138a2f3` on `claude/project-thread-zdhgmq`
- Last checkpoint: 2026-11-06T05:50:00Z by Claude Code

## Next action

Agent: merge PR #40 when the CI gate is green and confirm CI on main passes. Joshua Small: import .github/rulesets/main.json and enable Vercel Deployment Checks for CI gate (docs/ci/README.md).

## Completed

- PR #33 (mobile hero fixes) merged on GitHub; the revision 8 record still listed it as open
- PR #34: Playwright suite on next start (journeys, contact path through the real handler with a local Resend stand-in, axe and WCAG behaviour checks, performance and SEO budgets); Firefox and WebKit for @cross tests
- PR #34: CI gate aggregate job, SHA-pinned actions, actionlint, zizmor, gitleaks, CodeQL, Dependabot with cooldown
- PR #34: production.yml verifies production after each Vercel production deployment, every 6 hours and by hand; failures open a production-check issue; weekly.yml runs the full cross-browser suite, link checks and Lighthouse trends
- PR #34: app fixes found by tests: contact input types and lengths, body byte cap, provider timeout, no-store, Escape focus in the mobile menu, hero Pause pill contrast, X-Build-Commit header
- Independent review agent: 3 material and 11 minor findings; material ones fixed (axe animation wait, deployment_status comment, rename-safe docs-only check)
- docs/ci/README.md (pipeline, local commands, owner settings, rollback, exceptions) and docs/ci/EVIDENCE.md (requirements, evidence, score 81/100)
- PR #34 merged as 31724b15b9c6bbe62bb1f159829823d18983dd8d (2026-11-06 05:27 UTC) after all checks passed on c29f096; production verification passed from the deployment_status event at 05:28 UTC with production serving 31724b1
- Notification path checked with a dry run (impossible expected commit): verification failed as intended and the notify job printed the issue it would open; no issue created

## In progress

- PR #40 CI, then merge; weekly.yml manual run 42169371336 result to record

## Tests (agent-reported)

- `GitHub CI ci.yml on main`: pass at `1435e75`, 2026-11-02T19:00:00Z
- `Production smoke check (production-smoke.yml)`: pass at `1435e75`, 2026-11-02T19:00:00Z
- `GitHub CI ci.yml on main`: pass at `829ffc8`, 2026-11-02T19:11:50Z
- `npm run typecheck && eslint src/components/Hero.tsx && npm test && npm run build`: pass at `26e0854`, 2026-11-03T22:50:00Z
- `Playwright scroll check at 390x844: toggle bottom vs intro top at scroll 0/300/500/700`: pass at `26e0854`, 2026-11-03T22:50:00Z
- `eslint src/components/Hero.tsx && npm run build; Playwright 390x844 pixel sample across hero bottom edge`: pass at `273ad8b`, 2026-11-03T23:00:00Z
- `npm test (67), lint, typecheck, CI=1 playwright test --project=chromium (61 passed, 1 skipped)`: pass at `7ecb257`, 2026-11-06T00:47:00Z
- `GitHub CI ci.yml on PR #34 head (Chromium job rerun after an apt stall)`: pass at `c29f096`, 2026-11-06T05:26:58Z
- `production.yml from deployment_status after merging PR #34 (8/8 HTTP checks, 6/6 browser checks)`: pass at `31724b1`, 2026-11-06T05:28:36Z
- `GitHub CI ci.yml push on main`: fail at `31724b1`, 2026-11-06T05:34:10Z
- `production.yml workflow_dispatch expect_sha=0x40 notify_dry_run=true (failure path and notify dry run)`: pass at `31724b1`, 2026-11-06T05:36:10Z
- `npm run format:check; zizmor --offline .github/workflows/ci.yml; local Chromium launch probe`: pass at `138a2f3`, 2026-11-06T05:45:00Z

## Unverified changes

- Owner-reported (Joshua Small, 2026-11-02): contact email arrives; reduced motion passes; gradient text passes in light and dark mode; Vercel and Resend on free plans; failure emails enabled
- Owner-reported (Joshua Small, 2026-11-02): screen-reader testing passes and 200% zoom passes; screen reader, browser and OS not stated
- None of the above is a hub verify:record pass; hub gates remain unverified until the verifier records them
- Live production headers present and no X-Powered-By (agent-read through the Vercel connector, 2026-11-02)
- Mobile hero overlap fix checked by the agent in headless Chromium at 390px only; not checked on a real phone
- Firefox and WebKit runs are only verified in GitHub Actions (no WebKit locally)
- Delivery of the production-check issue notification to the owner has not been verified end to end
- ci.yml Chromium launch probe (PR #40) not yet seen on a GitHub runner at this checkpoint
