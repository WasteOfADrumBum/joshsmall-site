import { process } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Process() {
  return (
    <Section id="process" eyebrow="How I build" title="AI-assisted, human-accountable.">
      <Reveal>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">{process.intro}</p>
      </Reveal>
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {process.steps.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 0.1} className="h-full">
              <div className="h-full rounded-2xl border border-line bg-surface p-6">
                <span aria-hidden="true" className="font-mono text-4xl font-bold text-accent">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
