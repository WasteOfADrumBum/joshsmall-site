import { Building2, CheckCircle2, Cloud, Code2, Server } from "lucide-react";
import { skillGroups, type SkillGroup } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const icons: Record<SkillGroup["icon"], typeof Code2> = {
  code: Code2,
  server: Server,
  cloud: Cloud,
  test: CheckCircle2,
  building: Building2,
};

export function Skills() {
  return (
    <Section id="skills" eyebrow="Skills" title="The tools I work with every day.">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((group, i) => {
          const Icon = icons[group.icon];
          return (
            <li key={group.title}>
              <Reveal delay={i * 0.06} className="h-full">
                <div className="h-full rounded-2xl border border-line bg-surface p-6">
                  <Icon aria-hidden="true" className="size-8 text-accent" />
                  <h3 className="mt-4 text-xl font-semibold">{group.title}</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="rounded-full bg-bg px-3 py-1 text-sm text-muted">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
