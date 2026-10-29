"use client";

import { type RefObject, useEffect } from "react";
import { type Look, approach, idleLook, lookToward, tiltToLook } from "@/lib/look";

/** After this long with no pointer or tilt, the character looks around on its own. */
const IDLE_AFTER_MS = 4000;

/**
 * Eases the character toward the pointer, a touch, or phone tilt, and writes the pose to --lx/--ly
 * on the stage. Runs only while active, on screen, and in a visible tab.
 */
export function useLookTracking(stageRef: RefObject<HTMLDivElement | null>, look: RefObject<Look>, active: boolean) {
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !active) return;

    let target: Look = { x: 0, y: 0 };
    let lastInput = -Infinity;
    let onScreen = true;
    let frame = 0;

    const tick = (t: number) => {
      if (t - lastInput > IDLE_AFTER_MS) target = idleLook(t);
      look.current = approach(look.current, target);
      el.style.setProperty("--lx", look.current.x.toFixed(3));
      el.style.setProperty("--ly", look.current.y.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && onScreen && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (e: PointerEvent) => {
      target = lookToward(e.clientX, e.clientY, el.getBoundingClientRect(), {
        width: window.innerWidth,
        height: window.innerHeight,
      });
      lastInput = performance.now();
    };
    // Phones that send tilt without asking (Android) get it; iOS needs a permission prompt, so it uses touch only.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      target = tiltToLook(e.beta, e.gamma);
      lastInput = performance.now();
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    if (coarse) window.addEventListener("deviceorientation", onTilt);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(el);
    start();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [stageRef, look, active]);
}
