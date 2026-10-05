"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin gradient bar across the top showing how far down the page you are. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="grad-border fixed inset-x-0 top-0 z-[70] h-1 origin-left"
    />
  );
}
