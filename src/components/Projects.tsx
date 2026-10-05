import { Check, ExternalLink } from "lucide-react";
import { projects, type Project } from "@/content/site";
import { GitHubIcon } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-3xl border border-line bg-surface p-7 sm:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-3xl font-bold tracking-tight">{project.title}</h3>
        <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent">
          {project.status}
        </span>
      </div>
      <p className="mt-2 text-xl text-fg">{project.tagline}</p>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{project.description}</p>

      <ul className="mt-6 space-y-3">
        {project.highlights.map((h) => (
          <li key={h} className="flex gap-3 text-muted">
            <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-accent" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <ul aria-label="Technology used" className="mt-7 flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <li key={s} className="rounded-full bg-bg px-3 py-1 font-mono text-sm text-muted">
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-bg transition-transform hover:-translate-y-0.5"
          >
            View live <ExternalLink aria-hidden="true" size={18} />
            <span className="sr-only">(opens {project.title})</span>
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold transition-colors hover:bg-bg"
          >
            <GitHubIcon className="size-5" /> Source code
            <span className="sr-only">for {project.title}</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <Section id="projects" eyebrow="Projects" title="Things I've built and shipped.">
      <div className="space-y-8">
        {projects.map((p) => (
          <Reveal key={p.slug}>
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <p className="mt-8 text-muted">More projects are on the way. Follow along on GitHub.</p>
      </Reveal>
    </Section>
  );
}
