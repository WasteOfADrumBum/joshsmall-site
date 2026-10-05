import { RefreshCw, Rocket } from "lucide-react";
import { process } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SpotlightCard } from "./SpotlightCard";

const laneIcons = { rocket: Rocket, refresh: RefreshCw };

export function Process() {
  return (
    <Section id="process" eyebrow="How I build" title="Building new. Modernizing old.">
      <Reveal>
        <p className="max-w-2xl text-xl leading-relaxed text-muted">{process.intro}</p>
      </Reveal>

      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {process.lanes.map((lane, i) => {
          const Icon = laneIcons[lane.icon];
          return (
            <li key={lane.title}>
              <Reveal direction={i === 0 ? "left" : "right"} className="h-full">
                <SpotlightCard className="h-full rounded-3xl border border-line bg-surface p-8">
                  <Icon aria-hidden="true" className="size-12 text-accent-2" strokeWidth={1.5} />
                  <h3 className="mt-5 text-3xl font-bold tracking-tight">{lane.title}</h3>
                  <p className="mt-3 text-lg leading-relaxed text-muted">{lane.body}</p>
                </SpotlightCard>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <Reveal delay={0.1}>
        <h3 className="mt-14 font-mono text-sm uppercase tracking-[0.2em] text-muted">
          {process.principlesTitle}
        </h3>
      </Reveal>
      <ol className="mt-5 grid gap-5 md:grid-cols-3">
        {process.principles.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 0.1} direction="scale" className="h-full">
              <div className="h-full rounded-2xl border border-line p-6">
                <span aria-hidden="true" className="text-grad font-mono text-4xl font-bold">
                  0{i + 1}
                </span>
                <h4 className="mt-2 text-xl font-semibold">{step.title}</h4>
                <p className="mt-1 text-muted">{step.body}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
