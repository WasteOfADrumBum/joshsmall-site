import { stance } from "@/content/site";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

/** A short statement of how I work with AI, placed right under the hero so it's seen early. */
export function Stance() {
  return (
    <section aria-labelledby="stance-title" className="px-5 pb-8 sm:px-8">
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
      </div>
    </section>
  );
}
