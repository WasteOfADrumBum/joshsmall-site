<!-- generated from .engineering/state.json (revision 1) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 1, `closeout-2026-11-02-pf`, 2026-11-02T17:02:47Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

Read docs/release-scope-1.0.0.md and ROADMAP.md, then the hub acceptance record docs/acceptance/closeout-2026-11-02.md. Do not add roadmap items to 1.0.0.

## Unfinished

- Owner scope approval and gate verifications (hub acceptance record).

## Blockers

- scope-document-missing stays open in the hub until the owner approves the scope.

## Decisions

- [agent] Proposed 1.0.0 as the first release name for the site already live at onesmall.company; no new features in scope. Owner approval pending.
- [agent] CI type check runs after next build because Next generates the LayoutProps route types during the build.

## Constraints

- Release approval, tags and gate verification belong to Joshua Small.
- Enhancements live in ROADMAP.md and never block or reopen an accepted release.
- Secrets stay in Vercel environment variables; never in the repository or .engineering/.

## Unresolved decisions

- Owner approval of the 1.0.0 scope draft.
- 16 moderate dev-only advisories (minimatch in ESLint tooling); production audit clean.
