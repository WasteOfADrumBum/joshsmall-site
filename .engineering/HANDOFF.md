<!-- generated from .engineering/state.json (revision 1) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 1, `release-1.0-closure-4d4cc5d`, 2026-11-02T17:20:00Z by Claude Code (project thread: Close portfolio release)
- Written by: the agent (committed to git)
- Uncommitted work outside this checkpoint: **none**
- Roadmap: [ROADMAP.md](../ROADMAP.md). Release: [record](../docs/release/2026-11-portfolio-release.md), [acceptance](../docs/release/ACCEPTANCE.md)

## Continue with

Read docs/release/2026-11-portfolio-release.md and ACCEPTANCE.md. After merge, record the production commit and deployment ID in ACCEPTANCE.md. Optional work is in ROADMAP.md.

## Unfinished

- Owner gates in docs/release/ACCEPTANCE.md section 2

## Blockers

- Owner review/merge, post-deploy real contact send, provider billing confirmations, owner approval

## Decisions

- Rate limiting is in-memory per function instance (no paid or new service); global limit tracked as ROADMAP R1
- Git history is not rewritten to remove the personal email from old .env.example commits
- Optional work goes to ROADMAP.md; release gates only in docs/release/ACCEPTANCE.md

## Constraints

- No redesign or new product features in this release
- No paid services, billing changes, tracking, or history rewrites
- Production DNS changes (DMARC) need owner approval
- Release approval belongs to Joshua Small

## Unresolved decisions

- Owner approval of privacy note wording
- DMARC record (recommended, needs owner approval)
