import { about, career } from "@/content/site";
import { approximateYearsSince, completeYearsSince, formatYearsPlus } from "@/lib/dates";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SpotlightCard } from "./SpotlightCard";

/**
 * The experience counts are worked out on the server when the page renders. The page revalidates
 * daily (see `revalidate` in app/page.tsx), so they roll over on their own and the browser never
 * recalculates them, which keeps hydration consistent.
 */
export function About() {
  const now = new Date();
  const facts = [
    {
      label: about.professionalLabel,
      value: formatYearsPlus(approximateYearsSince(career.professionalStartYear, now)),
    },
    {
      label: about.softwareLabel,
      value: formatYearsPlus(completeYearsSince(career.softwareEngineeringStart, now)),
    },
    {
      label: about.currentLabel,
      value: `${career.employer} · ${formatYearsPlus(completeYearsSince(career.employerStart, now))}`,
    },
    ...about.facts,
  ];

  return (
    <Section id="about" eyebrow="About" title="Engineering with a focus on people and reliability.">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6 text-lg leading-relaxed text-muted">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.08} direction="left">
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
        <Reveal direction="right">
          <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {facts.map((f) => (
              <SpotlightCard key={f.label} className="px-6 py-5">
                <dt className="font-mono text-xs uppercase tracking-widest text-muted">{f.label}</dt>
                <dd className="mt-1 text-xl font-semibold">{f.value}</dd>
              </SpotlightCard>
            ))}
          </dl>
        </Reveal>
      </div>
    </Section>
  );
}
