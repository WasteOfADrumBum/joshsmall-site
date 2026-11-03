<!-- generated from .engineering/state.json (revision 7); edit state.json through a checkpoint, not this file -->

# personal-portfolio: development status

All values are **agent-reported**, not independently verified. Check GitHub before relying on them.

- Milestone: Portfolio release 1.0 (November 2026): complete and owner-approved in this repository; project in maintenance
- Active task: Fix mobile hero toggle overlapping the intro paragraph while scrolling
- Branch: `claude/project-thread-x6i52i`
- Recorded commit: `26e0854` on `claude/project-thread-x6i52i`
- Last checkpoint: 2026-11-03T22:50:00Z by Claude Code

## Next action

Joshua Small: review and merge the mobile hero overlap PR (claude/project-thread-x6i52i). Hub gates still need his verify:record passes; otherwise maintenance from ROADMAP.md when the owner asks.

## Completed

- PR #29 merged (827f659) and PR #28 merged (1435e75); production dpl_H2W4sexCyyGjyUhDuEdMHW1hYjee READY
- PR #30 merged by Joshua Small as 829ffc8: release 1.0 approval recorded in docs/release/ACCEPTANCE.md section 5
- PR #31 merged by Joshua Small: owner-reported screen-reader and 200% zoom results (screen reader and browser not stated) and ACCEPTANCE.md section 6 (evidence by hub gate)
- Hub PR one-small-engineering#72 merged: owner-reported evidence, target 1.0.0 and scope linked for personal-portfolio; approval stays pending until verification
- Optional owner settings moved to ROADMAP.md (O1-O4)
- .engineering/state.json re-recorded in the continuity contract v1 shape (revisions 1-4 failed validation); PR #32 and PR #31 both did this and are reconciled here

## In progress

- Mobile hero overlap fix on claude/project-thread-x6i52i: portrait scroll drift limited to md and up; PR open, awaiting owner review

## Tests (agent-reported)

- `GitHub CI ci.yml on main`: pass at `1435e75`, 2026-11-02T19:00:00Z
- `Production smoke check (production-smoke.yml)`: pass at `1435e75`, 2026-11-02T19:00:00Z
- `GitHub CI ci.yml on main`: pass at `829ffc8`, 2026-11-02T19:11:50Z
- `npm run typecheck && eslint src/components/Hero.tsx && npm test && npm run build`: pass at `26e0854`, 2026-11-03T22:50:00Z
- `Playwright scroll check at 390x844: toggle bottom vs intro top at scroll 0/300/500/700`: pass at `26e0854`, 2026-11-03T22:50:00Z

## Unverified changes

- Owner-reported (Joshua Small, 2026-11-02): contact email arrives; reduced motion passes; gradient text passes in light and dark mode; Vercel and Resend on free plans; failure emails enabled
- Owner-reported (Joshua Small, 2026-11-02): screen-reader testing passes and 200% zoom passes; screen reader, browser and OS not stated
- None of the above is a hub verify:record pass; hub gates remain unverified until the verifier records them
- Live production headers present and no X-Powered-By (agent-read through the Vercel connector, 2026-11-02)
- Mobile hero overlap fix checked by the agent in headless Chromium at 390px only; not checked on a real phone
