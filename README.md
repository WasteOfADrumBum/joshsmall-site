# onesmall.company: Joshua M. Small's portfolio

Full-stack & AI engineer building production TypeScript/React/Node.js software with AI-assisted delivery (Claude Code, Codex, Grok) and rigorous validation of what AI ships.

**Live:** [onesmall.company](https://onesmall.company)

## Tech stack

- **Framework:** Next.js 16.4.3 (App Router), React 19.2.8
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Motion & icons:** Motion, Lucide
- **Email:** Resend (contact form)
- **Hosting:** Vercel
- **Quality:** ESLint, TypeScript, Node's built-in test runner, run in GitHub Actions CI on every PR and push to `main`

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
#   CONTACT_FROM_EMAIL optional (defaults to Resend's onboarding sender)
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
| `npm test` | Run unit tests |
| `npx tsc --noEmit` | Type check (run after `npm run build`, which generates Next's route types) |

## Deploy

Vercel builds every pull request as a preview and deploys `main` to production at [onesmall.company](https://onesmall.company) (`joshsmall-portfolio.vercel.app` redirects there). Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and optionally `CONTACT_FROM_EMAIL` in the Vercel project's environment variables; never commit them. To roll back, promote the previous production deployment in Vercel (Deployments, the deployment, Promote to Production) or revert the merge on `main`.

## Release and roadmap

- Release scope: [docs/release-scope-1.0.0.md](docs/release-scope-1.0.0.md) (draft until the owner approves it).
- Future work: [ROADMAP.md](ROADMAP.md). Roadmap items are optional enhancements and never reopen a completed release.
- Release status, gates and evidence live in the [One Small Engineering hub](https://github.com/WasteOfADrumBum/one-small-engineering) registry; development state for agents lives in [.engineering/](.engineering/STATUS.md).

## Contact

- Portfolio: [onesmall.company](https://onesmall.company)
- LinkedIn: [linkedin.com/in/joshuamsmall](https://www.linkedin.com/in/joshuamsmall/)
- GitHub: [@WasteOfADrumBum](https://github.com/WasteOfADrumBum)
