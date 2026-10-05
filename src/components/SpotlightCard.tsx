"use client";

import type { MouseEvent, ReactNode } from "react";

/** A card with a soft glow that follows the cursor. Decorative only. */
export function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <div onMouseMove={onMove} className={`spotlight relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
