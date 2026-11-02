<!-- generated from .engineering/state.json (revision 4) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 4, `release-1.0-approved-maintenance`, 2026-11-02T19:15:00Z by Claude Code (project thread: Close portfolio release)
- Status: **release 1.0 complete and approved (Joshua Small, 2026-11-02); project in maintenance**
- Uncommitted work outside this checkpoint: **none**
- Roadmap: [ROADMAP.md](../ROADMAP.md). Release: [record](../docs/release/2026-11-portfolio-release.md), [acceptance](../docs/release/ACCEPTANCE.md)

## Continue with

Release 1.0 is complete and the project is in maintenance. Optional improvements are tracked in ROADMAP.md; start one only when the owner asks.

## Unfinished

_none recorded_

## Blockers

_none recorded_

## Decisions

- Rate limiting is in-memory per function instance (no paid or new service); global limit tracked as ROADMAP R1
- Git history is not rewritten to remove the personal email from old .env.example commits
- Optional work goes to ROADMAP.md; release gates only in docs/release/ACCEPTANCE.md
- PR #29 was merged to main by the owner on 2026-11-02 (17:54 UTC) while consolidation was in progress; #28 was brought up to date by merging main and carries the rest. #29's docs/RELEASE.md is replaced by docs/release/2026-11-portfolio-release.md
- Release 1.0 approved and known limits accepted by Joshua Small, 2026-11-02 (owner's own message, recorded at his direction)

## Constraints

- No redesign or new product features in this release
- No paid services, billing changes, tracking, or history rewrites
- Production DNS changes (DMARC) need owner approval
- Release approval belongs to Joshua Small

## Unresolved decisions

_none recorded_
