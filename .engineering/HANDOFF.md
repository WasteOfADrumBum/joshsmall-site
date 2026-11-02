<!-- generated from .engineering/state.json (revision 5) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 5, `ckpt-0005-contract-v1-shape`, 2026-11-02T23:10:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

Release 1.0 is complete and the project is in maintenance. Optional improvements are tracked in ROADMAP.md; start one only when the owner asks. Checkpoint re-recorded in the continuity contract v1 shape (the previous revision failed hub validation and showed as invalid in the hub aggregate); content carried over, nothing new claimed.

## Unfinished

_none recorded_

## Blockers

_none recorded_

## Decisions

- [agent] Rate limiting is in-memory per function instance (no paid or new service); global limit tracked as ROADMAP R1
- [human] Git history is not rewritten to remove the personal email from old .env.example commits (Joshua Small, project thread "Close portfolio release", 2026-11-02 19:06 UTC (accepted as a known limit))
- [agent] Optional work goes to ROADMAP.md; release gates only in docs/release/ACCEPTANCE.md
- [agent] PR #29 was merged by the owner on 2026-11-02 (17:54 UTC) while consolidation was in progress; #28 carries the rest. #29's docs/RELEASE.md is replaced by docs/release/2026-11-portfolio-release.md
- [human] Release 1.0 approved and the three known limits accepted (privacy note approved) (Joshua Small, project thread "Close portfolio release", 2026-11-02 19:06 UTC; ACCEPTANCE.md section 5)

## Constraints

- No redesign or new product features in this release
- No paid services, billing changes, tracking, or history rewrites
- Production DNS changes (DMARC) need owner approval
- Release approval belongs to Joshua Small

## Unresolved decisions

_none recorded_
