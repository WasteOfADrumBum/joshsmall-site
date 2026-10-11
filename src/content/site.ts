/**
 * All site copy lives here. To add a project, append one object to `projects`.
 * To add a side site (photography, audio), fill in its `url` in `sideProjects`.
 * Every entry renders with the same template, so new additions stay consistent.
 */

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Short "then → now" steps. */
  journey?: string[];
  highlights: string[];
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  status: "Live" | "In progress" | "Planned";
};

export type SideProject = {
  slug: string;
  kind: "photo" | "audio" | "fishing" | "family";
  title: string;
  blurb: string;
  /** Leave undefined until the site exists; the card shows "Coming soon". */
  url?: string;
};

export type SkillGroup = {
  title: string;
  icon: "code" | "server" | "cloud" | "test" | "building" | "ai";
  items: { name: string; href: string }[];
};

export const profile = {
  name: "Joshua M. Small",
  firstName: "Joshua",
  title: "Full-Stack Software Engineer",
  headline: "I build reliable software for the moments that matter.",
  headlineLead: "I build",
  headlineTail: "for the moments that matter.",
  /** Keep these about the same length so the slot stays tidy on phones. */
  rotatingPhrases: [
    "reliable software",
    "accessible apps",
    "scalable APIs",
    "modern systems",
    "AI-assisted tools",
  ],
  intro:
    "TypeScript, React and Node.js engineer working on enterprise software used in emergency management. I build new products and modernize old ones, with AI as my pair programmer.",
  location: "Trinity, North Carolina",
  email: "JMSmall89@gmail.com",
  github: "https://github.com/WasteOfADrumBum",
  linkedin: "https://www.linkedin.com/in/joshuamsmall",
  photo: "/joshua-portrait.webp",
  photoAlt:
    "Portrait of Joshua Small: glasses, a top knot and a long full beard, wearing a black hoodie in front of glowing code editor screens.",
  photoSize: 1254,
  availability: "Remote · Eastern Time · Open to opportunities",
};

export const about = {
  paragraphs: [
    "I'm a full-stack engineer at Juvare, where I build and modernize software used in emergency-management environments. I turn complex operational requirements into maintainable features, from the UI through APIs, testing and CI/CD.",
    "I architected a shared TypeScript and SCSS component library that unified several front-end libraries for federal implementations, then helped hand it off to a dedicated team to maintain.",
    "Before engineering, I ran teams and operations. That's why I think about how technical choices affect users, teams and business outcomes.",
    "I work remotely from North Carolina and do my best work in my own environment. I'm on Eastern Time and looking for remote roles only.",
  ],
  facts: [
    { label: "Experience", value: "6+ years in software" },
    { label: "Currently", value: "Juvare · 5 years" },
    { label: "Focus", value: "TypeScript · React · Node.js" },
    { label: "Growing into", value: "Cloud · DevOps · AI" },
    { label: "Works", value: "Remote · Eastern Time" },
  ],
};

export const beyond = {
  title: "When I'm away from the keyboard…",
  intro: "…this is who I am.",
};

export const sideProjects: SideProject[] = [
  {
    slug: "photography",
    kind: "photo",
    title: "Photography",
    blurb:
      "Professional photographer and retoucher since 2010. I shoot with Nikon DSLRs and finish every image in Adobe Creative Suite.",
    url: "https://one-small-photography.vercel.app/",
  },
  {
    slug: "audio",
    kind: "audio",
    title: "Drums & audio",
    blurb:
      "I play drums, record music and run live audio. Engineering sound has taught me a lot about getting details right.",
    url: "https://one-small-studio.vercel.app/",
  },
  {
    slug: "fishing",
    kind: "fishing",
    title: "Yak fishing",
    blurb: "Kayak fishing, or yak fishing. I grew up by the ocean, and water is my life.",
  },
  {
    slug: "family",
    kind: "family",
    title: "Family",
    blurb: "I'm the husband to my wife, Maggie, and father to my three children.",
  },
];

export const projects: Project[] = [
  {
    slug: "taskforge",
    title: "TaskForge",
    tagline: "A task manager built to run in production.",
    description:
      "Create an account, sign in and manage your own private tasks with priorities, due dates, status tracking, search and filters. Every day starts from a Command Center that shows what needs attention.",
    journey: [
      "Started before AI tools existed",
      "Modernized with ChatGPT and Codex",
      "Live in production today",
    ],
    highlights: [
      "JWT auth with hashed passwords; every query is scoped to its owner",
      "GitHub Actions runs format, lint, test, build and audit on every push",
      "Runs on free tiers: Vercel, Render and MongoDB Atlas",
    ],
    stack: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Vercel"],
    liveUrl: "https://taskforge-alpha-six.vercel.app/",
    repoUrl: "https://github.com/WasteOfADrumBum/TaskForge",
    status: "Live",
  },
  {
    slug: "one-small-jarvis",
    title: "One Small JARVIS",
    tagline: "A personal second-brain dashboard and planner.",
    description:
      "Links to my notes in Google Drive, pulls in calendar feeds and weather, and gives an at-a-glance view of the day. A planner view lays out tasks, today hour by hour, the week and the month on one screen.",
    highlights: [
      "Read-only Google Drive access, with a reader for notes and Docs",
      "Calendar events from iCal feeds and tasks from Todoist, behind a private key",
      "Plain HTML, CSS and JavaScript with no build step, plus two Vercel functions",
    ],
    stack: ["JavaScript", "HTML", "CSS", "Google Drive API", "Vercel Functions"],
    liveUrl: "https://cortex-brain-nu.vercel.app",
    repoUrl: "https://github.com/WasteOfADrumBum/cortex-brain-task",
    status: "Live",
  },
  {
    slug: "onesmallui",
    title: "OneSmallUI",
    tagline: "My own UI framework.",
    description:
      "A React component library with SCSS design tokens and a docs site with live examples and copyable code. Currently at v0.2.0.",
    highlights: [
      "Design tokens generate the SCSS maps and TypeScript theme in one build",
      "Every token pair is checked against WCAG AAA contrast",
      "Vitest and axe audits cover components and every docs page, light and dark",
    ],
    stack: ["React", "TypeScript", "SCSS", "Vitest", "axe-core", "Vercel"],
    liveUrl: "https://one-small-ui.vercel.app",
    repoUrl: "https://github.com/WasteOfADrumBum/one-small-ui",
    status: "In progress",
  },
  {
    slug: "one-small-mods-pack",
    title: "One Small Mods Pack",
    tagline: "Claude Code mods that hold AI to a project's rules while it works.",
    description:
      "Four mods, installable from one plugin marketplace, that check the code Claude writes as it writes it: accessibility, design tokens, quality gates and secret handling. Each failure goes back to Claude with the file, line and rule so it fixes the problem before moving on.",
    highlights: [
      "Automated WCAG 2.2 AA checks on every UI file Claude changes",
      "Blocks hardcoded colors and spacing, naming the design token to use instead",
      "Keeps Claude working until lint, type check and tests pass, and redacts secrets from what it reads",
    ],
    stack: ["TypeScript", "Claude Code", "ESLint", "axe-core"],
    repoUrl: "https://github.com/WasteOfADrumBum/one-small-mods-pack",
    status: "In progress",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    icon: "code",
    items: [
      { name: "TypeScript", href: "https://www.typescriptlang.org" },
      { name: "JavaScript", href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
      { name: "React", href: "https://react.dev" },
      { name: "HTML", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
      { name: "CSS / SCSS", href: "https://sass-lang.com" },
    ],
  },
  {
    title: "Backend",
    icon: "server",
    items: [
      { name: "Node.js", href: "https://nodejs.org" },
      { name: "Express", href: "https://expressjs.com" },
      { name: "REST APIs", href: "https://developer.mozilla.org/en-US/docs/Glossary/REST" },
      { name: "MongoDB", href: "https://www.mongodb.com" },
      { name: "SQL / PostgreSQL", href: "https://www.postgresql.org" },
    ],
  },
  {
    title: "DevOps & Cloud",
    icon: "cloud",
    items: [
      { name: "Git", href: "https://git-scm.com" },
      { name: "GitHub Actions", href: "https://github.com/features/actions" },
      { name: "CI/CD", href: "https://about.gitlab.com/topics/ci-cd/" },
      { name: "Docker", href: "https://www.docker.com" },
      { name: "Vercel", href: "https://vercel.com" },
      { name: "AWS", href: "https://aws.amazon.com" },
    ],
  },
  {
    title: "Quality",
    icon: "test",
    items: [
      { name: "Jest", href: "https://jestjs.io" },
      { name: "Vitest", href: "https://vitest.dev" },
      { name: "Code review", href: "https://google.github.io/eng-practices/review/" },
      { name: "Debugging", href: "https://developer.chrome.com/docs/devtools" },
      { name: "Secure development", href: "https://owasp.org/www-project-top-ten/" },
    ],
  },
  {
    title: "Enterprise",
    icon: "building",
    items: [
      { name: "WebEOC", href: "https://www.juvare.com/webeoc/" },
      { name: "Component libraries", href: "https://storybook.js.org" },
      { name: "Legacy modernization", href: "https://martinfowler.com/books/refactoring.html" },
      { name: "Agile", href: "https://agilemanifesto.org" },
    ],
  },
  {
    title: "AI",
    icon: "ai",
    items: [
      { name: "Claude", href: "https://claude.ai" },
      { name: "Claude Code", href: "https://claude.com/product/claude-code" },
      { name: "Gemini", href: "https://gemini.google.com" },
      { name: "ChatGPT", href: "https://chatgpt.com" },
      { name: "Codex", href: "https://openai.com/codex/" },
      { name: "Muse", href: "https://www.meta.ai" },
      { name: "Fieldy AI", href: "https://fieldy.ai" },
    ],
  },
];

export const process = {
  intro:
    "Modern development is two jobs: building new things with new tools, and bringing older software into the present. I do both, with AI as my pair programmer and me accountable for every line.",
  lanes: [
    {
      icon: "rocket" as const,
      title: "Build new",
      body: "This site, One Small JARVIS and OneSmallUI all started from a blank page. I design them, build them with Claude, then review, test and ship them myself. One Small Mods Pack goes a step further, with Claude Code mods that hold AI to a project's rules while it writes.",
    },
    {
      icon: "refresh" as const,
      title: "Modernize old",
      body: "At Juvare I modernize enterprise software used in emergency management. On my own time, TaskForge started before AI tools existed; I revived it with ChatGPT and Codex and took it to production.",
    },
  ],
  principlesTitle: "My ground rules",
  principles: [
    { title: "I own the design", body: "Architecture and trade-offs are my calls." },
    { title: "AI drafts, I review", body: "Nothing ships unread." },
    { title: "Automation guards quality", body: "Tests and CI run on every push." },
  ],
};

export const contact = {
  intro:
    "I'm open to remote opportunities and happy to talk about AI, engineering or collaborating on something. Send a message and I'll reply by email.",
  badges: ["Remote only", "Based in North Carolina", "Eastern Time (ET)"],
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#beyond", label: "Beyond" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];
