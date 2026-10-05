import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-16 px-5 py-24 sm:px-8 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h2
            id={`${id}-title`}
            className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl"
          >
            {title}
          </h2>
          <div aria-hidden="true" className="grad-border mt-6 h-1 w-24 rounded-full" />
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
