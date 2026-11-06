"use client";

import { MotionConfig, motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale";

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 40 },
  left: { x: -80 },
  right: { x: 80 },
  scale: { scale: 0.88, y: 20 },
};

/**
 * Animates content in as it enters the viewport and back out as it leaves,
 * so the effect plays whether you scroll down or back up.
 * Honors the visitor's reduced-motion setting.
 *
 * Visibility is measured on an outer box that never moves. Measuring the animated box itself
 * made an element sitting near the 20% threshold at a viewport edge flicker without end: sliding
 * in moved it out of view, which slid it back, which moved it into view again. `className` goes
 * on both boxes so layout classes such as `h-full` or a subgrid still apply to the content.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const hidden = { opacity: 0, ...offsets[direction] };
  return (
    <div ref={ref} className={className}>
      <motion.div
        className={className}
        initial={hidden}
        animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : hidden}
        transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
