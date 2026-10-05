"use client";

import { ArrowDown, Mail } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { profile } from "@/content/site";
import { GitHubIcon, LinkedInIcon } from "./Icons";

// Words flagged `hot` get the animated gradient.
const words = [
  { text: "I" },
  { text: "build" },
  { text: "reliable", hot: true },
  { text: "software", hot: true },
  { text: "for" },
  { text: "the" },
  { text: "moments" },
  { text: "that" },
  { text: "matter." },
];

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const ref = useRef<HTMLElement>(null);
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

          <h1
            id="hero-title"
            className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: -50 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-block ${w.hot ? "text-grad" : ""}`}
              >
                {w.text}
                {" "}
              </motion.span>
            ))}
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
              width={1086}
              height={1448}
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
