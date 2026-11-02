<!-- generated from .engineering/state.json (revision 1) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 1, `r1-closeout-5f0a849`, 2026-11-02T17:20:00Z by Claude Code (project thread: Close portfolio site release)
- Written by: the agent, committed with the closeout branch (local file)
- Uncommitted work outside this checkpoint: **none**

## Continue with

Check the closeout PR's CI, then the production deployment after merge; record its id in docs/RELEASE.md if needed.

## Unfinished

- Merge closeout PR (owner)
- Owner manual checks listed in docs/RELEASE.md

## Blockers

_none recorded_

## Decisions

- No real contact send repeated: the server send path is unchanged
- Privacy disclosure is a one-line note under the form, not a policy page (no cookies or tracking)
- Optional improvements recorded in ROADMAP.md, not implemented

## Constraints

- No redesign or new product features in this release
- Never record owner approvals as agent facts

## Unresolved decisions

- Contact API rate limiting (Vercel Firewall rule or accept honeypot + Resend 100/day cap)
- Failure notifications (Hobby keeps runtime logs 1 hour)
- DMARC record
- www.onesmall.company not attached to the project
- Personal email and birth date remain in public git history
