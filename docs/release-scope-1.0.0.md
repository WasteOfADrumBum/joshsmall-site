# Portfolio 1.0.0: release scope (draft for owner approval)

Status: **DRAFT**, proposed 2026-11-02 by Claude Code (builder). It becomes the approved scope only when Joshua Small approves it; until then the hub keeps blocker `scope-document-missing` open. Approval is the owner's alone.

Project: `personal-portfolio` in the [One Small Engineering registry](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/projects/registry.json). Tier: **Showcase** (10 gates in the hub's [Definition of Done](https://github.com/WasteOfADrumBum/one-small-engineering/blob/main/standards/definition-of-done.md)).

## Why 1.0.0

The site has no tags or releases; `package.json` 0.1.0 is a placeholder. Production at [onesmall.company](https://onesmall.company) already serves `main`. 1.0.0 names that live site as the first accepted release, so the release covers what exists rather than new features.

## In scope (what 1.0.0 is)

| # | Item | Where |
| --- | --- | --- |
| S1 | Single-page portfolio: hero, about, experience, skills, projects, process, stance, human side, beyond, footer | `src/components/`, `src/content/site.ts` |
| S2 | Contact form that emails through Resend, with required-field validation, line-break-safe subject and logged send failures | `src/app/api/contact/`, PRs #24, #26 |
| S3 | SEO and sharing: sitemap, robots, share image, icons, Person JSON-LD | PR #25 |
| S4 | Security headers and Content Security Policy | PR #26 |
| S5 | Accurate README (setup, environment, deploy, rollback) | `README.md` |
| S6 | CI on every PR and push to `main`: lint, unit tests, build, type check | `.github/workflows/ci.yml` |
| S7 | Production on Vercel at onesmall.company serving the release commit | Vercel project `joshsmall-portfolio` |

## Acceptance criteria (mapped to the Showcase gates)

| Gate | Criterion for 1.0.0 |
| --- | --- |
| `scope-complete` | Owner approves this document; S1–S7 present on the release commit. |
| `automated-checks` | CI green on the release commit. |
| `security-privacy-review` | Contact endpoint reviewed under the hub's `standards/security.md` (input validation, abuse, no secrets in client, headers); production dependency audit has no high or critical advisory. |
| `wcag-22-aa` | Automated check (for example axe) on the home page plus the owner's manual review. |
| `keyboard-screen-reader` | Owner keyboard-only and screen-reader pass over navigation and the contact form. |
| `responsive-layouts` | Owner checks phone, tablet, desktop and 200% zoom. |
| `critical-workflows` | Navigation and contact form (email arrives) work in production. |
| `production-deployment` | onesmall.company serves the release commit (Vercel deployment id recorded). |
| `documentation-accurate` | README matches the project as built. |
| `no-release-blockers` | No open blocker in the registry. |

## Out of scope (enhancements, see [ROADMAP.md](../ROADMAP.md))

More projects or content, a README screenshot, analytics, a blog, any visual redesign. Content updates never block or reopen this release.

## Release identity

Tag `v1.0.0` on the accepted commit and set `package.json` to 1.0.0 only after owner approval. The tag and any GitHub release are owner actions.
