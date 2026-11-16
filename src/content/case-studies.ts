/**
 * Long-form case studies, one page each at /work/<slug>. A project card links to its case study
 * when its `caseStudy` field names one of these slugs. Every claim here comes from the project's
 * own repository (README, roadmap, CI workflows), so keep it in step with those, not with memory.
 */

export type CaseStudySection = {
  heading: string;
  /** Paragraphs, in order. */
  body?: string[];
  /** A short list after the paragraphs. */
  points?: string[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  /** One sentence for the page intro, the meta description and the share card. */
  summary: string;
  role: string;
  status: string;
  stack: string[];
  liveUrl?: string;
  liveLabel?: string;
  repoUrl: string;
  sections: CaseStudySection[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "taskforge",
    title: "TaskForge",
    summary:
      "A task manager I started before AI coding tools existed, revived with AI agents and grown into a personal operations platform, one reviewed ticket at a time.",
    role: "Solo owner: product, architecture, review and release decisions. ChatGPT, Codex and Claude Code do much of the implementation inside a delivery process I set.",
    status: "Live. Phases 1 and 2 are complete; the core of Phases 3 to 7 is shipped; Phase 8 is planned.",
    stack: [
      "React 19",
      "TypeScript",
      "Vite",
      "Chakra UI",
      "Redux Toolkit",
      "Node.js",
      "Express 5",
      "MongoDB Atlas",
      "Vitest",
      "Jest",
      "Playwright",
      "Ollama",
    ],
    liveUrl: "https://task.onesmall.company",
    liveLabel: "Open TaskForge",
    repoUrl: "https://github.com/WasteOfADrumBum/TaskForge",
    sections: [
      {
        heading: "The starting point",
        body: [
          "TaskForge began as a plain task list written before AI coding assistants were around. I wanted it to become something I would trust with real work: private accounts, data no other user can reach, real tests and a deploy I can verify.",
          "The longer goal is a personal AI orchestration platform: agents with clear roles, shared knowledge and a daily command center. It also has to cost nothing extra to run, so it lives on free tiers and uses local AI where AI is used at all.",
        ],
      },
      {
        heading: "How the work gets done",
        body: [
          "Every change follows the same path: a Jira ticket, a branch, tests, an independent review, a pull request, CI, a merge, then a check that the live client and API are serving the merged commit before the ticket is closed. A green deploy alone doesn't count; the served build identity has to match.",
          "AI agents write much of the code, so the process is what keeps quality consistent. The roadmap is the source of truth, and nothing is marked complete until it is built and validated.",
        ],
      },
      {
        heading: "What it does today",
        points: [
          "Accounts with bcrypt-hashed passwords and signed JWTs; every task, project and agent query is scoped to its owner, with tests for cross-owner access",
          "Tasks, projects, search and filters, plus a Command Center with today's priorities, at-risk projects and agent activity",
          "An agent registry where agents propose drafts, and a person approves or rejects each one; approval is recorded in an audit trail, and assignment alone runs nothing",
          "Private notes and documents with keyword search and Ask TaskForge, which answers with exact citations; local embeddings run through Ollama",
          "Guided daily and weekly reviews, progress analytics from real completion times, and goals",
          "Career and learning tools: skills, saved jobs, rule-based skill gaps, a learning roadmap and portfolio-project ideas",
          "A Brand Studio with brand profiles, a WCAG contrast check for colors and a LinkedIn and GitHub profile kit",
        ],
      },
      {
        heading: "Decisions that mattered",
        points: [
          "AI goes through a provider abstraction that is off by default; production inference stays disabled, and local models run on the owner's machine",
          "Rule-based features are labeled as rule-based, so nothing pretends to be AI",
          "Agents only ever produce drafts and proposals; a human decision is the only thing that changes data",
          "Tests run at three levels: unit tests, real MongoDB and API tests, and Chromium browser flows",
        ],
      },
      {
        heading: "What's next",
        body: [
          "Phase 8, TaskForge building TaskForge, is planned with a human approval gate, an audit trail and no automatic merging to main. Calendar, email highlights and AI recommendations are still planned too.",
        ],
      },
    ],
  },
  {
    slug: "cortex",
    title: "Cortex",
    summary:
      "A private daily command center for my notes, tasks, calendar and projects, where an AI routine writes the morning briefing and nothing changes until I approve it.",
    role: "Solo: design, engineering and review, built with Claude Code.",
    status: "Live, with a public demo that runs the real pages on sample data.",
    stack: ["JavaScript", "HTML", "CSS", "Vercel Functions", "Google Drive API", "Todoist API", "Playwright", "axe-core"],
    liveUrl: "https://cortex.onesmall.company/demo",
    liveLabel: "Try the demo",
    repoUrl: "https://github.com/WasteOfADrumBum/cortex-brain-task",
    sections: [
      {
        heading: "The starting point",
        body: [
          "My notes live in Google Drive, my tasks in Todoist and my schedule in Google Calendar. I wanted one screen that pulls the day together, stays private, and doesn't depend on a computer left running at home.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Cortex is plain HTML, CSS and JavaScript with no build step, plus small Vercel functions. It has six tabs, each with its own link: Home, Planner, Finances, News, Vault and Ops, plus a Briefing page.",
        ],
        points: [
          "Home: today's schedule with the largest open block, a Top 3 ranked by rules with a short reason for each, and the morning briefing",
          "Planner: tasks sorted by urgency and size, today hour by hour, the week and the month on one screen",
          "Vault: every note in the Second Brain with search, filters and a reader",
          "Ops: deploy state, open pull requests and shipping totals across my projects from GitHub",
          "News: headlines from free RSS feeds, with broken feeds skipped and named",
        ],
      },
      {
        heading: "AI that proposes, a person who decides",
        body: [
          "Each weekday morning a Claude routine writes a briefing file to Drive. Cortex reads it and turns each suggestion into a card with Approve and Reject. Before acting, the server checks the action against an allowlist, re-reads the task or event, and refuses with \"Stale, review again\" if it changed since the briefing was written.",
          "Only five actions are supported, nothing is ever deleted, reschedules come with a 10-second Undo, and every decision goes into an audit log. Gmail stays inside the routine; Cortex never gets access to it.",
        ],
      },
      {
        heading: "Privacy and security",
        points: [
          "The browser asks Google Drive for read-only access; the server can only write the files Cortex creates",
          "Private task topics show only as a generic label on the Home screen",
          "The dashboard key is compared in constant time, and signed-out visitors see a sign-in screen, never sample data",
        ],
      },
      {
        heading: "Quality",
        body: [
          "CI type-checks the code, runs the tests, audits production dependencies and scans every demo tab with axe for accessibility on every change. The demo's sample data uses the same TypeScript types as the real data, so the two can't drift apart.",
        ],
      },
    ],
  },
  {
    slug: "engineering-hub",
    title: "One Small Engineering Hub",
    summary:
      "The governance repository that keeps every One Small project honest: one registry, shared standards and release rules that AI agents and I both follow.",
    role: "Solo: standards, schema, validator and automation, built with Claude Code and reviewed by me.",
    status: "In daily use across the One Small projects.",
    stack: ["JSON Schema", "Node.js", "GitHub Actions", "Markdown"],
    repoUrl: "https://github.com/WasteOfADrumBum/one-small-engineering",
    sections: [
      {
        heading: "The starting point",
        body: [
          "I build with several AI tools at once: Claude, ChatGPT, Codex and others. Each one can report that work is done, and each one starts a session without remembering the last. I needed one place that says what is actually true about every project, and rules that keep an AI's word from counting as proof.",
        ],
      },
      {
        heading: "What it is",
        body: [
          "The Hub is deliberately small: GitHub, JSON, Markdown and a dependency-free Node validator. There is no app, dashboard or database, and no application code or secrets.",
        ],
        points: [
          "A project registry with a versioned schema covering eight projects, each with its release status, gates, blockers and linked evidence",
          "A three-tier Definition of Done, a security standard and release governance",
          "A validator in CI that enforces fifteen rules, from unique IDs to rejecting credentials, email addresses and account-like numbers",
          "Thin adapters so Claude, Codex, Copilot and Gemini all read the same instructions",
        ],
      },
      {
        heading: "Rules that keep AI honest",
        points: [
          "A release gate is verified only with passing evidence recorded by a verifier who is not the builder",
          "Evidence from automation or an AI assessment can inform but can never verify a gate",
          "Only I can approve a release, and approval needs linked evidence",
          "Each project keeps a checkpoint file that the next agent reads before starting, and CI checks it against the Hub's schema",
        ],
      },
      {
        heading: "Automation",
        body: [
          "A scheduled sync reads each project's GitHub state and proposes registry updates as one pull request per project. Routine, automation-owned changes merge on their own after every safety check passes; anything that touches gates, blockers, ownership, scope or approval waits for me.",
        ],
      },
      {
        heading: "Why it matters",
        body: [
          "It turns \"the AI says it's done\" into \"here is the evidence, from someone other than the builder.\" That is how I let agents move fast across many repositories without losing track of what is real.",
        ],
      },
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
