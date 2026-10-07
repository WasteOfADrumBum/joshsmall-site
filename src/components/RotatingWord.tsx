"use client";

import { useEffect, useState } from "react";

const LEAVE_MS = 280;

/**
 * Flips through phrases on a fixed timer. All phrases are laid out invisibly in the same
 * grid cell, so the slot is always as big as the biggest one and nothing around it moves.
 * Timing uses plain timers (not animation callbacks) so the flip can't get stuck.
 * Decorative: the headline's real text is provided to screen readers separately.
 */
export function RotatingWord({
  phrases,
  running,
  interval = 3200,
}: {
  phrases: string[];
  running: boolean;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!running) return;
    let swap: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      setLeaving(true);
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % phrases.length);
        setLeaving(false);
      }, LEAVE_MS);
    }, interval);
    return () => {
      clearInterval(id);
      clearTimeout(swap);
      setLeaving(false);
    };
  }, [running, interval, phrases.length]);

  return (
    <span aria-hidden="true" className="grid">
      {phrases.map((p) => (
        <span key={p} className="invisible col-start-1 row-start-1 justify-self-start whitespace-nowrap pb-[0.1em]">
          {p}
        </span>
      ))}
      {/* Remounts with each phrase, so the entrance and the color sweep restart every time. */}
      <span
        key={index}
        className={`col-start-1 row-start-1 justify-self-start ${leaving ? "word-out" : "word-in"}`}
      >
        <span
          className="text-sweep inline-block whitespace-nowrap pb-[0.1em]"
          style={{ animationPlayState: running ? "running" : "paused" }}
        >
          {phrases[index]}
        </span>
      </span>
    </span>
  );
}
