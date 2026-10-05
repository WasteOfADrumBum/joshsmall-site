/**
 * All site copy lives here. To add a project, append one object to `projects`.
 * The Projects section renders every entry with the same card template.
 */

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  status: "Live" | "In progress" | "Planned";
};

export type SkillGroup = {
  title: string;
  icon: "code" | "server" | "cloud" | "test" | "building";
  items: string[];
};

export const profile = {
  name: "Joshua Small",
  firstName: "Josh",
  title: "Full-Stack Software Engineer",
  headline: "I build reliable software for the moments that matter.",
  intro:
    "TypeScript, React and Node.js engineer working on enterprise software used in emergency management. Growing toward cloud, DevOps and AI-enabled applications.",
  location: "Trinity, North Carolina",
  email: "JMSmall89@gmail.com",
  github: "https://github.com/WasteOfADrumBum",
  linkedin: "https://www.linkedin.com/in/joshuamsmall",
  photography: "https://www.onesmallphoto.com",
  photo: "/josh.webp",
  photoAlt:
    "Portrait of Joshua Small: glasses, a top knot and a long full beard, wearing a black shirt against a warm amber backdrop.",
};

export const about = {
  paragraphs: [
    "I'm a full-stack engineer at Juvare, where I build and modernize software used in emergency-management environments. I turn complex operational requirements into maintainable features, from the UI through APIs, testing and CI/CD.",
    "I architected a shared TypeScript and SCSS component library that unified several front-end libraries for federal implementations, then helped hand it off to a dedicated team to maintain.",
    "Before engineering, I ran teams and operations. That's why I think about how technical choices affect users, teams and business outcomes.",
  ],
  facts: [
    { label: "Experience", value: "5+ years at Juvare" },
    { label: "Focus", value: "TypeScript · React · Node.js" },
    { label: "Growing into", value: "Cloud · DevOps · AI" },
    { label: "Based in", value: "North Carolina" },
  ],
  beyond:
    "Away from the keyboard: photography (I run One Small Photo), drums and live audio production.",
};

export const projects: Project[] = [
  {
    slug: "taskforge",
    title: "TaskForge",
    tagline: "A task manager built to run in production.",
    description:
      "Create an account, sign in and manage your own private tasks with priorities, due dates, status tracking, search and filters. Every day starts from a Command Center that shows what needs attention.",
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
    "I use AI assistants as pair programmers. They speed up the routine parts so my time goes to the decisions that matter.",
  steps: [
    {
      title: "I own the design",
      body: "Architecture, data models and trade-offs are decided by me, with AI as a sounding board.",
    },
    {
      title: "AI drafts, I review",
      body: "Claude, ChatGPT and Codex help write code, tests and docs. Nothing ships unread.",
    },
    {
      title: "Automation guards quality",
      body: "Linting, tests and CI checks run on every push, so mistakes get caught early.",
    },
  ],
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#process", label: "Process" },
  { href: "#contact", label: "Contact" },
];
