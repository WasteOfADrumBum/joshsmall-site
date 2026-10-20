/**
 * All site copy lives here. To add a project, append one object to `projects`.
 * To add a side site (photography, audio), fill in its `url` in `sideProjects`.
 * Every entry renders with the same template, so new additions stay consistent.
 */

import type { CareerDate } from "@/lib/dates";

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
  kind: "photo" | "audio" | "fishing" | "family" | "moto" | "gaming";
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

/**
 * Career start dates, the only place they live. Record only the precision that's known: leave out
 * `day` when only the month is known, and `month` when only the year is. The About panel turns
 * these into year counts with src/lib/dates.ts, so they stay current without edits.
 */
export const career = {
  /** Start of "Life experience": month and year only, never the full date. Not displayed. */
  lifeStart: { year: 1989, month: 1 } satisfies CareerDate,
  /** Approximate: I started working around 2006. */
  professionalStartYear: 2006,
  softwareEngineeringStart: { year: 2021, month: 1 } satisfies CareerDate,
  employer: "Juvare",
  employerStart: { year: 2021, month: 11 } satisfies CareerDate,
};

export const about = {
  paragraphs: [
    "I'm a full-stack engineer at Juvare, working directly within federal emergency-management environments to modernize mission-critical software. I bridge operational requirements, stakeholder needs, and production engineering, from UX and APIs through testing, automation, and delivery.",
    "I architected a shared TypeScript and SCSS component library that unified several front-end libraries for federal implementations, then helped hand it off to a dedicated team to maintain.",
    "AI has made code cheap to write. It hasn't made it cheap to know whether that code is right. I spend my effort there: validating what AI produces, understanding how the whole system fits together, and deciding which work is worth automating and which needs a person.",
    "Before engineering, I ran teams and operations. That's why I think about how technical choices affect users, teams and business outcomes.",
    "I work remotely from North Carolina and do my best work in my own environment. I'm on Eastern Time and looking for remote roles only.",
  ],
  /** Experience counts and the current role are calculated from `career` in the About component. */
  lifeLabel: "Life experience",
  professionalLabel: "Professional experience",
  softwareLabel: "Software engineering",
  currentLabel: "Currently",
  facts: [
    { label: "Focus", value: "TypeScript · React · Node.js" },
    { label: "Growing into", value: "Cloud · DevOps · AI" },
    { label: "Works", value: "Remote · Eastern Time" },
  ],
};

export const stance = {
  eyebrow: "Why it matters",
  lead: "My advantage as a senior engineer isn't generating the most code.",
  highlight: "It's validating what gets generated, understanding the system it lands in, and deciding what should be automated at all.",
  stats: [
    { value: "~2/3", label: "of developers now use coding assistants or agents" },
    { value: "31%", label: "of daily users spend four or more hours a day with them" },
    { value: "<10%", label: "would trust AI with important decisions" },
  ],
  source: "Stack Overflow developer survey of 30,903 developers, as reported by",
  sourceOutlet: "Business Insider",
  sourceUrl:
    "https://www.businessinsider.com/developers-are-burned-out-as-ai-coding-reshapes-work-survey-2026-10",
};

/**
 * Findings from Elon's survey sit apart from my responses. Numbers match Elon's own summary graphic
 * (x.com/elonuniversity/status/2110098285956301023) and the published report linked below.
 */
export const humanSide = {
  eyebrow: "The human side of AI",
  title: "The future of work is changing. I'm building the skills to help shape it.",
  intro:
    "AI is changing more than how we write code. It's changing how people work, what organizations need, and how individuals think about their professional futures. I take those changes seriously. Rather than waiting to see where technology takes my career, I'm actively developing the skills to help shape how it's used.",
  cards: [
    {
      title: "Work Should Mean Something",
      stat: "81%",
      finding: "of workers say paid work is extremely or very important to their family role.",
      response:
        "I build software with a purpose beyond delivering features. I care about solving real problems, supporting the people who depend on those systems, and creating something that provides lasting value.",
      value: "Human-centered engineering, ownership, and meaningful business outcomes.",
    },
    {
      title: "Change Demands Adaptability",
      stat: "83%",
      finding: "of U.S. adults expect AI to eliminate more jobs than it creates.",
      response:
        "I don't assume yesterday's skills will be enough tomorrow. I'm actively expanding my capabilities in AI, automation, application development, and system architecture so I can continue contributing as technology and engineering roles evolve.",
      value: "Adaptability, continuous learning, and practical modernization.",
    },
    {
      title: "Technology Should Empower People",
      stat: "65%",
      finding: "of U.S. adults believe less meaningful work would erode human purpose and dignity.",
      response:
        "I believe the best automation removes unnecessary friction without removing human judgment. My goal is to create systems that make people more capable and help them focus on the work that matters.",
      value: "Responsible automation, accessibility, UX, and thoughtful technical decisions.",
    },
    {
      title: "Adoption Needs Ownership",
      stat: "66%",
      finding:
        "of workers are comfortable with workplace AI or open to it with training. However, 49% believe most workers will have little control over their professional futures.",
      response:
        "I don't want to depend on AI systems I can't evaluate or understand. I'm developing the skills to design, integrate, test, and oversee these technologies while keeping people accountable for their outcomes.",
      value: "Engineering judgment, AI integration, risk awareness, and technical accountability.",
    },
  ],
  source:
    "Survey findings: Elon University Imagining the Digital Future Center, national survey of 1,158 U.S. adults conducted Aug. 20–24, 2026, published October 2026 as",
  sourceTitle: "The Meaning of Work in the AI Age",
  sourceUrl:
    "https://imaginingthedigitalfuture.org/reports-and-publications/the-meaning-of-work-in-the-ai-age/",
  sourceNote: "Responses and values are my own.",
  findingLabel: "The data",
  responseLabel: "My move",
  valueLabel: "What you get:",
  closingLead: "I don't just adapt to new technology.",
  closingHighlight: "I help turn it into lasting value.",
  closingBody:
    "I bring full-stack engineering experience, end-to-end ownership, and a practical approach to AI adoption. Building something quickly isn't the same as building something well. My focus is delivering reliable systems, making sound technical decisions, and helping teams use emerging technology with confidence.",
};

export const experience = {
  eyebrow: "Experience that connects",
  title: "I didn't start in software. I built toward it.",
  intro:
    "Nearly two decades of customer relationships, business operations, creative production, and technology taught me to solve problems from more than one perspective. Engineering gave me the tools to build the solutions myself.",
  cards: [
    {
      icon: "handshake" as const,
      title: "Business & Customers",
      body: "B2B/B2C strategy, consultative sales, marketing campaigns, client relationships, and translating needs into value.",
    },
    {
      icon: "users" as const,
      title: "Leadership & Operations",
      body: "Team development, operational turnarounds, performance improvement, cross-functional coordination, and ownership.",
    },
    {
      icon: "palette" as const,
      title: "Design & Experience",
      body: "Photography, visual design, audio engineering, brand identity, UX thinking, and user-centered communication.",
    },
    {
      icon: "code" as const,
      title: "Engineering & Delivery",
      body: "Production software, federal implementations, full-stack architecture, automated QA, CI/CD, and AI-assisted workflows.",
    },
  ],
  closingLabel: "Where it all comes together",
  closingBody:
    "I can work directly with stakeholders, understand the business, navigate complex environments, and own the solution from discovery through production. That's the foundation of forward-deployed engineering, and it's work I'm already doing.",
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
    url: "https://photo.onesmall.company",
  },
  {
    slug: "audio",
    kind: "audio",
    title: "Drums & audio",
    blurb:
      "I play drums, record music and run live audio. Engineering sound has taught me a lot about getting details right.",
    url: "https://studio.onesmall.company",
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
  {
    slug: "motorcycles",
    kind: "moto",
    title: "Motorcycles",
    blurb:
      "I ride an Indian Scout Bobber. Nothing beats the open road and the sense of freedom that comes with it.",
  },
  {
    slug: "gaming",
    kind: "gaming",
    title: "Gaming",
    blurb:
      "Achievement hunter on Xbox and PC. 100% is just the start; I push every game to its limits. Once I've beaten it fair and square, I mod it way past anything the devs intended.",
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
    liveUrl: "https://task.onesmall.company",
    repoUrl: "https://github.com/WasteOfADrumBum/TaskForge",
    status: "Live",
  },
  {
    slug: "onesmallui",
    title: "OneSmallUI",
    tagline: "An interface for the next generation.",
    description:
      "A space-themed React component library that looks like it shipped on a starship, built on React, TypeScript and SCSS design tokens. The docs site has live examples and copyable code, and it's on npm today: npm install @onesmall/ui.",
    highlights: [
      "Passes WCAG AAA while looking like this, with light and dark themes driven by SCSS tokens",
      "Utility classes, smooth motion and drag and drop built in, all driven by classes and data attributes",
      "Tailwind-style responsive utilities with Bootstrap-friendly names",
      "Machine-readable docs for AI agents, generated from the same data as the docs pages, plus an agent skill in the npm package so coding assistants use it correctly",
    ],
    stack: ["React", "TypeScript", "SCSS", "Vitest", "axe-core", "npm"],
    liveUrl: "https://ui.onesmall.company",
    repoUrl: "https://github.com/WasteOfADrumBum/one-small-ui",
    status: "Live",
  },
  {
    slug: "cortex",
    title: "Cortex",
    tagline: "A personal second-brain dashboard and planner.",
    description:
      "Links to my notes in Google Drive, pulls in calendar feeds and weather, and gives an at-a-glance view of the day. A planner view lays out tasks, today hour by hour, the week and the month on one screen.",
    highlights: [
      "Read-only Google Drive access, with a reader for notes and Docs",
      "Calendar events from iCal feeds and tasks from Todoist, behind a private key",
      "Plain HTML, CSS and JavaScript with no build step, plus two Vercel functions",
    ],
    stack: ["JavaScript", "HTML", "CSS", "Google Drive API", "Vercel Functions"],
    liveUrl: "https://cortex.onesmall.company",
    repoUrl: "https://github.com/WasteOfADrumBum/cortex-brain-task",
    status: "Live",
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
  practices:
    "Either way, the practices are the same: I own the architecture, test and validate what gets written, build accessibility in from the start, and automate the checks so reliability doesn't depend on anyone remembering.",
  lanes: [
    {
      icon: "rocket" as const,
      title: "Build new",
      body: "This site, Cortex and OneSmallUI all started from a blank page. I design them, build them with Claude, then review, test and ship them myself. One Small Mods Pack goes a step further, with Claude Code mods that hold AI to a project's rules while it writes.",
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
    { title: "I decide what to automate", body: "Judgment calls stay with a person." },
  ],
};

export const contact = {
  intro:
    "I'm open to remote opportunities and happy to talk about AI, engineering or collaborating on something. Send a message and I'll reply by email.",
  badges: ["Remote only", "Based in North Carolina", "Eastern Time (ET)"],
};

/** Same order as the sections on the page. */
export const nav = [
  { href: "#why-it-matters", label: "Why it matters" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#human-side", label: "Human side" },
  { href: "#experience", label: "Experience" },
  { href: "#process", label: "Process" },
  { href: "#beyond", label: "Beyond" },
  { href: "#contact", label: "Contact" },
];
