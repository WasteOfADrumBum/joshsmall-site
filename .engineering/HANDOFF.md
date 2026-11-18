<!-- generated from .engineering/state.json (revision 14) -->

# Handoff: personal-portfolio

Read this, then **verify against GitHub** (branch head, open PRs, CI) before continuing. Nothing below is independently verified.

- Checkpoint: revision 14, `ci-workflows-green-2026-11-18`, 2026-11-18T23:38:41Z by Cursor (grok-4.7)
- Written by: a local edit that the agent then pushed; confirm the branch head matches
- Uncommitted work outside this checkpoint: **none**

## Continue with

PR #55 is open for Joshua Small to review. Do not merge. Production verification and the weekly suite were green on 1925984 (production run 44421641072, weekly run 44421640942, CI run 44421641268). The checkpoint commit removes the temporary pull_request triggers used only because this session could not dispatch workflows. Issue #54 will not close itself on the next passing scheduled run. Next: owner review of PR #55, then the resume PDF, impact numbers, and the remaining ROADMAP Q3 five-run acceptance.

## Unfinished

- PR #55 (production and weekly workflow fixes) is open for Joshua Small to review; do not merge from an agent session
- Issue #54 stays open; the production workflow does not close it when a run passes
- Resume PDF and profile.resumeUrl (owner supplies the file)
- Verified impact numbers for the page (owner supplies)
- ROADMAP Q3 acceptance is still five consecutive weekly runs. The double-click path that cleared a successful send was fixed on this branch
- Owner settings: ruleset import for main; Vercel Deployment Checks
- Hub registry gates for personal-portfolio need Joshua Small's own verify:record passes; hub approval follows

## Blockers

- Branch protection and Vercel Deployment Checks need the owner (no write access to rulesets or Vercel settings from this session)

## Decisions

- [agent] Rate limiting is in-memory per function instance (no paid or new service); global limit tracked as ROADMAP R1
- [human] Git history is not rewritten to remove the personal email from old .env.example commits (Joshua Small, project thread "Close portfolio release", 2026-11-02 19:06 UTC (accepted as a known limit))
- [agent] Optional work goes to ROADMAP.md; release gates only in docs/release/ACCEPTANCE.md
- [agent] PR #29 was merged by the owner while consolidation was in progress; #28 merged main and carries the rest; #29's docs/RELEASE.md replaced by docs/release/2026-11-portfolio-release.md
- [human] Joshua Small approved the privacy note, accepted the three known limits and approved release 1.0 (Project thread "Close portfolio release", message of 2026-11-02 19:06 UTC; docs/release/ACCEPTANCE.md section 5 at 829ffc8)
- [agent] One aggregate CI gate job is the only check to require; docs-only PRs skip build and browser jobs and the gate validates that skip
- [agent] WebKit tests against the local http server strip HSTS and the CSP upgrade-insecure-requests directive in the test harness only; deployed headers are checked by production verification
- [agent] Chromium CI job skips install-deps' optional fallback-font packages when a real Chromium launch already works; full install-deps runs otherwise (documented exception in docs/ci/README.md)
- [agent] Browser-running jobs pinned to ubuntu-24.04 (Playwright-supported); ubuntu-latest 26.04 apt mirror stalled browser package installs
- [agent] Professional experience counts completed years with completeYearsSince. The homepage stays prerendered; the existing daily revalidate (86400s) regenerates the server-rendered count. The browser does not recompute it.

## Constraints

- No redesign or new product features in this release
- No paid services, billing changes, tracking, or history rewrites
- Production DNS changes (DMARC) need owner approval
- Release approval belongs to Joshua Small

## Unresolved decisions

- Hub registry approval for personal-portfolio stays pending until Joshua Small records his own verify:record passes for all ten gates (hub validator: approval needs releaseStatus verified, which needs every gate verified)
- Protecting main (ruleset import) and Vercel Deployment Checks are owner settings this session cannot change; see docs/ci/README.md
- Firefox/WebKit contact flake in the weekly suite (ROADMAP Q3): API answered 200 but the form showed nothing for 12 s; cause unknown (test load or real UI issue)
