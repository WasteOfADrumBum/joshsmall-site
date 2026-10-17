import { humanSide } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SpotlightCard } from "./SpotlightCard";

/**
 * What the wider workforce worries about and how I'm responding. Survey findings and my responses
 * are labeled separately so one is never mistaken for the other.
 */
export function HumanSide() {
  return (
    <Section id="human-side" eyebrow={humanSide.eyebrow} title={humanSide.title}>
      <Reveal>
        <p className="max-w-3xl text-xl leading-relaxed text-muted">{humanSide.intro}</p>
      </Reveal>

      {/*
        Each card spans four rows of the list's grid and shares them through subgrid, so the
        title, finding, response and value rows line up across every card in a row.
      */}
      <ul className="mt-10 grid gap-x-5 sm:grid-cols-2 xl:grid-cols-4">
        {humanSide.cards.map((card, i) => (
          <li key={card.title} className="row-span-4 grid grid-rows-subgrid pb-5">
            <Reveal delay={i * 0.08} className="row-span-4 grid grid-rows-subgrid">
              <SpotlightCard className="row-span-4 grid grid-rows-subgrid rounded-3xl border border-line bg-surface">
                <h3 className="px-6 pt-6 text-xl font-bold tracking-tight">{card.title}</h3>

                <div className="px-6 pb-5 pt-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted">{humanSide.findingLabel}</p>
                  <p className="mt-1 text-muted">
                    <span className="inline-block bg-[image:var(--grad-text)] bg-clip-text font-mono text-5xl font-bold text-transparent">{card.stat}</span>
                    <span className="mt-1 block text-sm leading-relaxed">{card.finding}</span>
                  </p>
                </div>

                <div className="border-t border-line px-6 pt-5">
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">{humanSide.responseLabel}</p>
                  <p className="mt-2 leading-relaxed">{card.response}</p>
                </div>

                <p className="px-6 pb-6 pt-5 text-sm leading-relaxed text-muted">
                  <span className="font-semibold text-fg">{humanSide.valueLabel}</span> {card.value}
                </p>
              </SpotlightCard>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-sm text-muted">
        {humanSide.source}{" "}
        <a href={humanSide.sourceUrl} className="underline underline-offset-4 transition-colors hover:text-fg">
          {humanSide.sourceTitle}
        </a>
        . {humanSide.sourceNote}
      </p>

      <Reveal direction="scale">
        <div className="grad-border mt-14 rounded-3xl p-[2px]">
          <SpotlightCard className="rounded-[calc(1.5rem-2px)] bg-surface p-8 md:p-12">
            <h3 className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
              {humanSide.closingLead} <span className="text-grad">{humanSide.closingHighlight}</span>
            </h3>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{humanSide.closingBody}</p>
          </SpotlightCard>
        </div>
      </Reveal>
    </Section>
  );
}
