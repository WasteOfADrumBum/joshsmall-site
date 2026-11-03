<!-- generated from .engineering/state.json (revision 6) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 6, `ckpt-0006-merge-main-into-pr32`, 2026-11-03T04:35:00Z by Claude Code
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

Release 1.0 is complete and approved in this repository; project in maintenance. The hub registry shows approval pending until Joshua Small records verify:record passes for its ten gates. Optional work is in ROADMAP.md; start one only when the owner asks.

## Unfinished

- Hub registry gates for personal-portfolio need Joshua Small's own verify:record passes; hub approval follows

## Blockers

_none recorded_

## Decisions

- [agent] Rate limiting is in-memory per function instance (no paid or new service); global limit tracked as ROADMAP R1
- [human] Git history is not rewritten to remove the personal email from old .env.example commits (Joshua Small, project thread "Close portfolio release", 2026-11-02 19:06 UTC (accepted as a known limit))
- [agent] Optional work goes to ROADMAP.md; release gates only in docs/release/ACCEPTANCE.md
- [agent] PR #29 was merged by the owner while consolidation was in progress; #28 merged main and carries the rest; #29's docs/RELEASE.md replaced by docs/release/2026-11-portfolio-release.md
- [human] Joshua Small approved the privacy note, accepted the three known limits and approved release 1.0 (Project thread "Close portfolio release", message of 2026-11-02 19:06 UTC; docs/release/ACCEPTANCE.md section 5 at 829ffc8)

## Constraints

- No redesign or new product features in this release
- No paid services, billing changes, tracking, or history rewrites
- Production DNS changes (DMARC) need owner approval
- Release approval belongs to Joshua Small

## Unresolved decisions

- Hub registry approval for personal-portfolio stays pending until Joshua Small records his own verify:record passes for all ten gates (hub validator: approval needs releaseStatus verified, which needs every gate verified)
