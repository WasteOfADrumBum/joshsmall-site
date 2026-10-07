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
  kind: "photo" | "audio";
  title: string;
  blurb: string;
  /** Leave undefined until the site exists; the card shows "Coming soon". */
  url?: string;
};

export type SkillGroup = {
  title: string;
  icon: "code" | "server" | "cloud" | "test" | "building";
  items: string[];
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
  intro: "…I'm still making things.",
};

export const sideProjects: SideProject[] = [
  {
    slug: "photography",
    kind: "photo",
    title: "Photography",
    blurb:
      "Professional photographer and retoucher since 2010. I shoot with Nikon DSLRs and finish every image in Adobe Creative Suite.",
  },
  {
    slug: "audio",
    kind: "audio",
    title: "Drums & audio",
    blurb:
      "I play drums, record music and run live audio. Engineering sound has taught me a lot about getting details right.",
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
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    icon: "code",
    items: ["TypeScript", "JavaScript", "React", "HTML", "CSS / SCSS"],
  },
  {
    title: "Backend",
    icon: "server",
    items: ["Node.js", "Express", "REST APIs", "MongoDB", "SQL / PostgreSQL"],
  },
  {
    title: "DevOps & Cloud",
    icon: "cloud",
    items: ["Git", "GitHub Actions", "CI/CD", "Docker", "Vercel", "AWS"],
  },
  {
    title: "Quality",
    icon: "test",
    items: ["Jest", "Vitest", "Code review", "Debugging", "Secure development"],
  },
  {
    title: "Enterprise",
    icon: "building",
    items: ["WebEOC", "Component libraries", "Legacy modernization", "Agile"],
  },
];

export const process = {
  intro:
    "Modern development is two jobs: building new things with new tools, and bringing older software into the present. I do both, with AI as my pair programmer and me accountable for every line.",
  lanes: [
    {
      icon: "rocket" as const,
      title: "Build new",
      body: "This site is an example. I designed and built it with Claude, then reviewed, tested and shipped it myself.",
    },
    {
      icon: "refresh" as const,
      title: "Modernize old",
      body: "TaskForge started before AI tools existed. I revived it with ChatGPT and Codex and took it to production.",
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
