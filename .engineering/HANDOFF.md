<!-- generated from .engineering/state.json (revision 3) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 3, `release-1.0-post-deploy-owner-checks`, 2026-11-02T19:10:00Z by Claude Code (project thread: Close portfolio release)
- Written by: the agent (committed to git)
- Uncommitted work outside this checkpoint: **none**
- Roadmap: [ROADMAP.md](../ROADMAP.md). Release: [record](../docs/release/2026-11-portfolio-release.md), [acceptance](../docs/release/ACCEPTANCE.md)

## Continue with

Nothing for an agent to do on the release. Optional work is in ROADMAP.md. Do not record approval on the owner's behalf.

## Unfinished

- Owner approval items in docs/release/ACCEPTANCE.md (privacy wording, known limits, section 5 signature)

## Blockers

- Owner release approval (belongs to Joshua Small)

## Decisions

- Rate limiting is in-memory per function instance (no paid or new service); global limit tracked as ROADMAP R1
- Git history is not rewritten to remove the personal email from old .env.example commits
- Optional work goes to ROADMAP.md; release gates only in docs/release/ACCEPTANCE.md
- PR #29 was merged to main by the owner on 2026-11-02 (17:54 UTC) while consolidation was in progress; #28 was brought up to date by merging main and carries the rest. #29's docs/RELEASE.md is replaced by docs/release/2026-11-portfolio-release.md

## Constraints

- No redesign or new product features in this release
- No paid services, billing changes, tracking, or history rewrites
- Production DNS changes (DMARC) need owner approval
- Release approval belongs to Joshua Small

## Unresolved decisions

- Owner approval of privacy note wording
- Owner acceptance of known limits (per-instance rate limit, personal data in git history, dev-only minimatch advisory)
- Release approval (ACCEPTANCE.md section 5)
