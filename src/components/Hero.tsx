"use client";

import { ArrowDown, Mail, Pause, Play } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { profile } from "@/content/site";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { RotatingWord } from "./RotatingWord";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const running = !paused && !reduceMotion;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  return (
    <section
      id="top"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative overflow-hidden px-5 pb-20 pt-32 sm:px-8 md:pb-32 md:pt-44"
    >
      <motion.div aria-hidden="true" style={{ y: glowY }} className="pointer-events-none absolute inset-0">
        <div className="aurora aurora-a -right-24 top-0 h-[28rem] w-[28rem]" />
        <div className="aurora aurora-b right-1/3 top-1/2 h-[24rem] w-[24rem]" />
        <div className="aurora aurora-c -left-32 top-10 h-[26rem] w-[26rem]" />
      </motion.div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-[1.3fr_1fr]">
        <motion.div style={{ y: textY }}>
          <motion.p
            {...fade(0)}
            className="font-mono text-sm uppercase tracking-[0.2em] text-accent"
          >
            {profile.title}
          </motion.p>

          <motion.div {...fade(0.1)} className="mt-3 flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-sm text-muted">
              <span aria-hidden="true" className="relative flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2.5 rounded-full bg-ok" />
              </span>
              {profile.availability}
            </p>
            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play headline animation" : "Pause headline animation"}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
              >
                {paused ? <Play aria-hidden="true" size={14} /> : <Pause aria-hidden="true" size={14} />}
                {paused ? "Play" : "Pause"}
              </button>
            )}
          </motion.div>

          {/* Screen readers get the full sentence once; the animated version below is decorative. */}
          <h1
            id="hero-title"
            className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="sr-only">{profile.headline}</span>
            <span aria-hidden="true" className="block">
              <motion.span {...fade(0.15)} className="block">
                {profile.headlineLead}
              </motion.span>
              <motion.span {...fade(0.3)} className="block">
                <RotatingWord phrases={profile.rotatingPhrases} running={running} />
              </motion.span>
              <motion.span {...fade(0.45)} className="block">
                {profile.headlineTail}
              </motion.span>
            </span>
          </h1>

          <motion.p {...fade(0.9)} className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            <span className="font-semibold text-fg">Hi, I&apos;m {profile.firstName}.</span>{" "}
            {profile.intro}
          </motion.p>

          <motion.div {...fade(1.05)}>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="btn-grad inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
              >
                View my work <ArrowDown aria-hidden="true" size={18} />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold transition-colors hover:border-accent hover:bg-surface"
              >
                <Mail aria-hidden="true" size={18} /> Contact me
              </a>
            </div>
            <ul className="mt-8 flex gap-6" aria-label="Profiles">
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
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: photoY }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div aria-hidden="true" className="grad-border pulse-glow absolute -inset-3 rounded-[2rem] blur-2xl" />
          <div className="grad-border relative rounded-3xl p-[3px]">
            <Image
              src={profile.photo}
              alt={profile.photoAlt}
              width={profile.photoSize}
              height={profile.photoSize}
              priority
              sizes="(min-width: 768px) 24rem, 90vw"
              className="h-auto w-full rounded-[1.3rem]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
