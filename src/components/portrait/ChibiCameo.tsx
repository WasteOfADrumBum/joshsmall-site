"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState, useSyncExternalStore } from "react";
import type { Look } from "@/lib/look";
import { AvatarModel } from "./avatar";
import { useLookTracking } from "./useLookTracking";

/**
 * A second appearance by chibi Joshua: he jumps up from the bottom of his box the first time it
 * scrolls into view, then watches the cursor. Decorative, since the hero already describes him.
 * With reduced motion he's simply standing there.
 */
const noop = () => () => {};

export function ChibiCameo({ className = "" }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const look = useRef<Look>({ x: 0, y: 0 });
  // Reduced motion is only known in the browser, so the first render matches the server's.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduceMotion = useReducedMotion() && hydrated;
  const inView = useInView(stageRef, { once: true, amount: 0.7 });
  const [ready, setReady] = useState(false);
  const popped = inView && ready;

  useLookTracking(stageRef, look, popped && hydrated && !reduceMotion);

  return (
    <div
      ref={stageRef}
      aria-hidden="true"
      className={`portrait-stage relative aspect-square overflow-hidden rounded-t-2xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgb(255_176_32/0.16),transparent_65%)]" />
      <motion.div
        initial={false}
        animate={{ y: popped || reduceMotion ? "0%" : "105%" }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 14 }}
        className="absolute inset-0"
      >
        <AvatarModel look={look} onReady={() => setReady(true)} active={popped} />
      </motion.div>
    </div>
  );
}
