# onesmall.company: Joshua M. Small's portfolio

Full-stack & AI engineer building production TypeScript/React/Node.js software with AI-assisted delivery (Claude Code, Codex, Grok) and rigorous validation of what AI ships.

**Live:** [onesmall.company](https://onesmall.company)

[![CI](https://github.com/WasteOfADrumBum/joshsmall-site/actions/workflows/ci.yml/badge.svg)](https://github.com/WasteOfADrumBum/joshsmall-site/actions/workflows/ci.yml)

## Tech stack

- **Framework:** Next.js 16.4.3 (App Router), React 19.2.8
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Motion & icons:** Motion, Lucide
- **Email:** Resend (contact form)
- **Hosting:** Vercel
- **Quality:** ESLint, TypeScript, Node's built-in test runner, GitHub Actions CI and a scheduled production smoke check

## Highlights

- Server-rendered App Router site with generated `sitemap.xml` and `robots.txt` for clean indexing
- Contact form that sends through Resend without exposing a personal email address
- Responsive, accessible UI built with Tailwind and subtle motion
- Showcases [TaskForge](https://task.onesmall.company) and other full-stack and AI work
- Built using AI-assisted development, with every change reviewed and validated by hand

## Run locally

```bash
git clone https://github.com/WasteOfADrumBum/joshsmall-site.git
cd joshsmall-site
npm install
# Contact form reads these from .env.local:
#   RESEND_API_KEY     required
#   CONTACT_TO_EMAIL   required (where messages are delivered)
#   CONTACT_FROM_EMAIL optional (defaults to Resend's onboarding sender,
#                      which can only deliver to your own Resend account address)
cat > .env.local <<'EOF'
RESEND_API_KEY=your_key
CONTACT_TO_EMAIL=you@example.com
EOF
npm run dev
```

Then open http://localhost:3000.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint |
| `npm run typecheck` | Generate route types and type-check |
| `npm test` | Run unit tests |

CI runs lint, typecheck, tests, the production build and a production-dependency audit on every pull request.

## Project docs

- [Roadmap](./ROADMAP.md): future enhancements, kept separate from release blockers
- [Release record](./docs/release/2026-11-portfolio-release.md) and [acceptance record](./docs/release/ACCEPTANCE.md) for release 1.0
- [Project checkpoint](./.engineering/HANDOFF.md): current state for the next contributor

## Contact

- Portfolio: [onesmall.company](https://onesmall.company)
- LinkedIn: [linkedin.com/in/joshuamsmall](https://www.linkedin.com/in/joshuamsmall/)
- GitHub: [@WasteOfADrumBum](https://github.com/WasteOfADrumBum)
