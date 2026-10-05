import { ArrowDown, Mail } from "lucide-react";
import Image from "next/image";
import { profile } from "@/content/site";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 md:pb-32 md:pt-44"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 h-[34rem] w-[34rem] rounded-full bg-accent/15 blur-[120px]"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.3fr_1fr]">
        <div>
          <Reveal>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
              {profile.title}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1
              id="hero-title"
              className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl"
            >
              {profile.headline}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
              <span className="font-semibold text-fg">Hi, I&apos;m {profile.firstName}.</span>{" "}
              {profile.intro}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-bg transition-transform hover:-translate-y-0.5"
              >
                View my work <ArrowDown aria-hidden="true" size={18} />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold transition-colors hover:bg-surface"
              >
                <Mail aria-hidden="true" size={18} /> Contact me
              </a>
            </div>
            <ul className="mt-8 flex gap-4" aria-label="Profiles">
              <li>
                <a
                  href={profile.github}
                  className="flex items-center gap-2 text-muted transition-colors hover:text-fg"
                >
                  <GitHubIcon className="size-6" />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  className="flex items-center gap-2 text-muted transition-colors hover:text-fg"
                >
                  <LinkedInIcon className="size-6" />
                  <span>LinkedIn</span>
                </a>
              </li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="mx-auto w-full max-w-sm">
          <div className="relative overflow-hidden rounded-3xl border border-line shadow-2xl shadow-accent/10">
            <Image
              src={profile.photo}
              alt={profile.photoAlt}
              width={1086}
              height={1448}
              priority
              sizes="(min-width: 768px) 24rem, 90vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
