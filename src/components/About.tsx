import { about, profile } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function About() {
  return (
    <Section id="about" eyebrow="About" title="Engineering with a focus on people and reliability.">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 text-lg leading-relaxed text-muted">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p>{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.3}>
            <p>
              {about.beyond}{" "}
              <a href={profile.photography} className="text-accent underline underline-offset-4">
                See the photography
              </a>
              .
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {about.facts.map((f) => (
              <div key={f.label} className="px-6 py-5">
                <dt className="font-mono text-xs uppercase tracking-widest text-muted">{f.label}</dt>
                <dd className="mt-1 text-xl font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
