"use client";

import {
  Aperture,
  Camera,
  Drum,
  Fish,
  Gamepad2,
  Heart,
  Keyboard,
  Motorbike,
  Trophy,
  Waves,
  Wind,
} from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useSyncExternalStore } from "react";
import { beyond, sideProjects, type SideProject } from "@/content/site";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

// Two rows of three cards need room, so the pinned scroll effect only runs on big screens.
const PINNED_QUERY =
  "(min-width: 1100px) and (min-height: 860px) and (prefers-reduced-motion: no-preference)";

function usePinned() {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(PINNED_QUERY);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(PINNED_QUERY).matches,
    () => false,
  );
}

function Visual({ kind }: { kind: SideProject["kind"] }) {
  switch (kind) {
    case "photo":
      return (
        <div aria-hidden="true" className="relative grid size-28 place-items-center">
          <span className="absolute left-0 top-0 size-6 rounded-tl-lg border-l-4 border-t-4 border-accent" />
          <span className="absolute right-0 top-0 size-6 rounded-tr-lg border-r-4 border-t-4 border-accent" />
          <span className="absolute bottom-0 left-0 size-6 rounded-bl-lg border-b-4 border-l-4 border-accent" />
          <span className="absolute bottom-0 right-0 size-6 rounded-br-lg border-b-4 border-r-4 border-accent" />
          <Aperture className="spin-slow size-14 text-accent-2" strokeWidth={1.5} />
          <Camera className="absolute size-5 text-fg" />
        </div>
      );
    case "audio":
      return (
        <div aria-hidden="true" className="flex h-28 items-end gap-2">
          {[0, 0.3, 0.6, 0.15, 0.45].map((d) => (
            <span key={d} className="eq-bar" style={{ animationDelay: `${d}s` }} />
          ))}
          <Drum className="ml-3 size-12 self-center text-accent-2" strokeWidth={1.5} />
        </div>
      );
    case "fishing":
      return (
        <div aria-hidden="true" className="relative grid h-28 w-28 place-items-center">
          <Fish className="bob size-14 text-accent-2" strokeWidth={1.5} />
          <Waves className="absolute bottom-1 size-14 text-accent-3" strokeWidth={1.5} />
        </div>
      );
    case "family":
      return (
        <div aria-hidden="true" className="grid h-28 w-28 place-items-center">
          <Heart className="heartbeat size-16 fill-accent-2/20 text-accent-2" strokeWidth={1.5} />
        </div>
      );
    case "moto":
      return (
        <div aria-hidden="true" className="relative flex h-28 w-28 items-center">
          <Wind className="gust absolute left-0 size-8 text-accent-3" strokeWidth={1.5} />
          <Motorbike className="ride ml-6 size-[4.5rem] text-accent-2" strokeWidth={1.5} />
        </div>
      );
    case "gaming":
      return (
        <div aria-hidden="true" className="relative grid h-28 w-28 place-items-center">
          <Gamepad2 className="size-16 text-accent-2" strokeWidth={1.5} />
          <Trophy className="bob absolute right-1 top-3 size-7 text-accent" strokeWidth={1.75} />
        </div>
      );
  }
}

function SideCard({ item, compact = false }: { item: SideProject; compact?: boolean }) {
  return (
    <SpotlightCard
      className={`h-full rounded-3xl border border-line bg-surface ${compact ? "p-6" : "p-7"}`}
    >
      {compact ? (
        <div className="h-[4.2rem] origin-top-left scale-[0.6]">
          <Visual kind={item.kind} />
        </div>
      ) : (
        <Visual kind={item.kind} />
      )}
      <h3 className={`${compact ? "mt-4" : "mt-6"} font-bold tracking-tight ${compact ? "text-xl" : "text-2xl"}`}>
        {item.title}
      </h3>
      <p className={`leading-relaxed text-muted ${compact ? "mt-2" : "mt-3"}`}>{item.blurb}</p>
      {item.kind === "photo" || item.kind === "audio" ? (
        <div className={compact ? "mt-4" : "mt-6"}>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-grad inline-flex rounded-full px-5 py-2.5 font-semibold">
              Visit site<span className="sr-only"> for {item.title}</span>
            </a>
          ) : (
            <span className="inline-flex rounded-full border border-line px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-muted">
              Site coming soon
            </span>
          )}
        </div>
      ) : null}
    </SpotlightCard>
  );
}

function PinnedCard({
  item,
  p,
  start,
  from,
}: {
  item: SideProject;
  p: MotionValue<number>;
  start: number;
  from: string;
}) {
  const x = useTransform(p, [start, start + 0.3], [from, "0%"]);
  const opacity = useTransform(p, [start, start + 0.25], [0, 1]);
  return (
    <motion.div style={{ x, opacity }} className="h-full">
      <SideCard item={item} compact />
    </motion.div>
  );
}

/** Wide screens: the section pins while scroll drives the animation, both directions. */
function Pinned() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const keyOpacity = useTransform(p, [0, 0.25], [1, 0]);
  const keyScale = useTransform(p, [0, 0.25], [1, 0.3]);
  const keyY = useTransform(p, [0, 0.25], [0, -180]);
  const keyRotate = useTransform(p, [0, 0.25], [0, -30]);
  const subOpacity = useTransform(p, [0, 0.15], [1, 0]);
  const titleY = useTransform(p, [0.15, 0.4], ["0vh", "-36vh"]);
  const titleScale = useTransform(p, [0.15, 0.4], [1, 0.55]);

  // Two rows of three: left cards fly in from the left, middle ones fade in, right ones
  // come from the right, top row first.
  const slots = [
    { start: 0.2, from: "-110%" },
    { start: 0.25, from: "0%" },
    { start: 0.3, from: "110%" },
    { start: 0.35, from: "-110%" },
    { start: 0.4, from: "0%" },
    { start: 0.45, from: "110%" },
  ];

  return (
    <div ref={ref} className="relative h-[210vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-8">
        <motion.div
          aria-hidden="true"
          style={{ opacity: keyOpacity, scale: keyScale, y: keyY, rotate: keyRotate }}
          className="absolute -mt-52 text-accent"
        >
          <Keyboard className="size-28" strokeWidth={1.25} />
        </motion.div>

        <motion.div style={{ y: titleY, scale: titleScale }} className="absolute px-6 text-center">
          <h2
            id="beyond-title"
            className="text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
          >
            When I&apos;m away from the <span className="text-grad">keyboard…</span>
          </h2>
          <motion.p style={{ opacity: subOpacity }} className="mt-4 text-xl text-muted">
            {beyond.intro}
          </motion.p>
        </motion.div>

        <ul className="relative mt-28 grid w-full max-w-6xl grid-cols-3 gap-4">
          {sideProjects.map((item, i) => (
            <li key={item.slug}>
              <PinnedCard item={item} p={p} start={slots[i].start} from={slots[i].from} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Smaller screens and reduced motion: no pinning, simple reveals instead. */
function Static() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal>
        <Keyboard aria-hidden="true" className="size-14 text-accent" strokeWidth={1.25} />
        <h2
          id="beyond-title"
          className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl"
        >
          When I&apos;m away from the <span className="text-grad">keyboard…</span>
        </h2>
        <p className="mt-3 text-xl text-muted">{beyond.intro}</p>
      </Reveal>
      <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sideProjects.map((item, i) => (
          <li key={item.slug}>
            <Reveal direction={i % 2 === 0 ? "left" : "right"} className="h-full">
              <SideCard item={item} />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Beyond() {
  const pinned = usePinned();
  return (
    <section id="beyond" aria-labelledby="beyond-title" className="scroll-mt-16">
      {pinned ? <Pinned /> : <Static />}
    </section>
  );
}
