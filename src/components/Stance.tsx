import { humanSide, stance } from "@/content/site";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

/**
 * How I work with AI, placed right under the hero so it's seen early, followed by what the
 * wider workforce worries about and how I'm responding. Survey findings and my responses are
 * labeled separately so one is never mistaken for the other.
 */
export function Stance() {
  return (
    <section id="why-it-matters" aria-labelledby="stance-title" className="scroll-mt-16 px-5 pb-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal direction="scale">
          <div className="grad-border rounded-3xl p-[2px]">
            <SpotlightCard className="rounded-[calc(1.5rem-2px)] bg-surface p-8 md:p-12">
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">{stance.eyebrow}</p>
              <h2
                id="stance-title"
                className="mt-4 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl"
              >
                {stance.lead} <span className="text-grad">{stance.highlight}</span>
              </h2>

              <ul className="mt-10 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
                {stance.stats.map((s) => (
                  <li key={s.label}>
                    <span className="block font-mono text-4xl font-bold">{s.value}</span>
                    <span className="mt-1 block text-muted">{s.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted">
                Source: {stance.source}{" "}
                <a
                  href={stance.sourceUrl}
                  className="underline underline-offset-4 transition-colors hover:text-fg"
                >
                  {stance.sourceOutlet}
                </a>
                .
              </p>
            </SpotlightCard>
          </div>
        </Reveal>

        <div className="mt-20 md:mt-24">
          <Reveal>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">{humanSide.eyebrow}</p>
            <h3 className="mt-3 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-balance md:text-5xl">
              {humanSide.title}
            </h3>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{humanSide.intro}</p>
          </Reveal>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {humanSide.cards.map((card, i) => (
              <li key={card.title}>
                <Reveal delay={i * 0.08} className="h-full">
                  <SpotlightCard className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6">
                    <h4 className="text-xl font-bold tracking-tight">{card.title}</h4>

                    <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">Survey finding</p>
                    <p className="mt-1 text-muted">
                      <span className="block font-mono text-4xl font-bold text-fg">{card.stat}</span>
                      <span className="mt-1 block text-sm leading-relaxed">{card.finding}</span>
                    </p>

                    <div className="mt-5 border-t border-line pt-5">
                      <p className="font-mono text-xs uppercase tracking-widest text-accent">My response</p>
                      <p className="mt-2 leading-relaxed">{card.response}</p>
                    </div>

                    <p className="mt-auto pt-5 text-sm leading-relaxed text-muted">
                      <span className="font-semibold text-fg">What I bring:</span> {card.value}
                    </p>
                  </SpotlightCard>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            {humanSide.source}{" "}
            <a
              href={humanSide.sourceUrl}
              className="underline underline-offset-4 transition-colors hover:text-fg"
            >
              {humanSide.sourceTitle}
            </a>
            . {humanSide.sourceNote}
          </p>

          <Reveal direction="scale">
            <div className="mt-14 rounded-3xl border border-line p-8 md:p-12">
              <h3 className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                {humanSide.closingLead} <span className="text-grad">{humanSide.closingHighlight}</span>
              </h3>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted">{humanSide.closingBody}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
