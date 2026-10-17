import { Code2, Handshake, Palette, Users } from "lucide-react";
import { experience } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SpotlightCard } from "./SpotlightCard";

const icons = { handshake: Handshake, users: Users, palette: Palette, code: Code2 };

/** Where the judgment comes from: the career behind the engineering, between Human side and Process. */
export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title}>
      <Reveal>
        <p className="max-w-3xl text-xl leading-relaxed text-muted">{experience.intro}</p>
      </Reveal>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {experience.cards.map((card, i) => {
          const Icon = icons[card.icon];
          return (
            <li key={card.title}>
              <Reveal delay={(i % 2) * 0.08} direction="scale" className="h-full">
                <SpotlightCard className="h-full rounded-2xl border border-line bg-surface p-6">
                  <Icon aria-hidden="true" className="size-9 text-accent" />
                  <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{card.body}</p>
                </SpotlightCard>
              </Reveal>
            </li>
          );
        })}
      </ul>

      <Reveal direction="scale">
        <div className="grad-border mt-10 rounded-3xl p-[2px]">
          <SpotlightCard className="rounded-[calc(1.5rem-2px)] bg-surface p-8">
            <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-accent">{experience.closingLabel}</h3>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed">{experience.closingBody}</p>
          </SpotlightCard>
        </div>
      </Reveal>
    </Section>
  );
}
