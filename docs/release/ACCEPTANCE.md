# Acceptance record: portfolio release 1.0 (November 2026)

Owner and release approver: **Joshua Small**. Only the owner ticks the boxes in sections 2 to 4 and signs section 5. An AI agent may fill in section 1 and must not tick owner boxes. Evidence for every line is in the [release record](./2026-11-portfolio-release.md).

## 1. Agent-recorded state (2026-11-02)

- [x] Release scope recorded (release record, section 1)
- [x] Production identity recorded (release record, section 2)
- [x] Local lint, typecheck, 59 unit tests, production build: pass (agent-run)
- [x] Production dependencies: 0 npm advisories (agent-run)
- [x] Secret scan of working tree and all 76 commits: none found (agent-run)
- [x] Live headers, redirect, caching, image optimization, 404: checked (agent-run)
- [x] axe WCAG A/AA: 0 violations at three viewport/theme combinations (agent-run)
- [x] Slow-network run: LCP 2.2 s at 400 kbit/s (agent-run)
- [x] CI green on the release PR #28: [run 41487445853](https://github.com/WasteOfADrumBum/joshsmall-site/actions/runs/41487445853), "Lint, typecheck, test and build" passed 2026-11-02 on commit `12e3504`

Owner-reported evidence:

- **Joshua Small, 2026-11-02:** contact emails arrive successfully (before this release's contact-route changes).

## 2. Owner gates (required for release)

- [ ] Release PR reviewed, CI green, merged to `main`
- [ ] Production deployment of the merge commit is READY on Vercel. Commit: `________` Deployment: `dpl_________`
- [ ] One real message sent from https://onesmall.company/#contact after that deploy arrives in the inbox
- [ ] Privacy note wording next to the contact form approved
- [ ] Manual contrast check of gradient text and translucent cards (the elements axe could not judge) passes in both light and dark mode
- [ ] Vercel plan and spending: confirmed Hobby, or a spend limit is set (https://vercel.com/teams/task-forge3/settings/billing)
- [ ] Resend plan: confirmed free plan, no paid overage (https://resend.com/settings/billing)
- [ ] Vercel deployment-failure email notifications on (https://vercel.com/account/settings/notifications)
- [ ] GitHub Actions failure notifications on, and the "Production smoke check" workflow run once by hand and green

## 3. Recommended, not blocking

- [ ] DMARC record added for `onesmall.company`
- [ ] Required status check "Lint, typecheck, test and build" on `main` (branch protection)
- [ ] Share previews refreshed in LinkedIn Post Inspector

## 4. Known, accepted limits

- [ ] Accepted: rate limiting is per function instance (best effort), not global
- [ ] Accepted: the owner's personal email remains in old commits of `.env.example`; history is not rewritten
- [ ] Accepted: dev-only `minimatch` advisory in the ESLint toolchain until ESLint ships a fix

## 5. Approval

Decision: ☐ Approved for release ☐ Not approved

Name: Joshua Small  Date: __________

Notes:
