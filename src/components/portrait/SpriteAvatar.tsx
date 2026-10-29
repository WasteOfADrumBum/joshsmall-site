"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/look";
import { type ClipName, SHEET, clips, flourishes, frameAt, sheetPosition, stepToward } from "@/lib/sprite";
import type { AvatarModelProps } from "./avatar";
import { PlaceholderAvatar } from "./PlaceholderAvatar";

const SHEET_URL = "/avatar/joshua-sprites.webp";
/** How far he can run from the middle, as a share of the box width. */
const RANGE = 0.22;
/** With no pointer for this long, he wanders on his own now and then. */
const WANDER_AFTER_MS = 6000;
/** After standing still this long he does one of his little routines. */
const FLOURISH_AFTER_MS = 9000;

/** Run after the page has loaded and the browser is idle, so the sprite sheet never competes with first paint. */
const whenIdle = (fn: () => void) => {
  const hasIdle = typeof window.requestIdleCallback === "function";
  let id = 0;
  const go = () => {
    id = hasIdle ? window.requestIdleCallback(fn, { timeout: 2000 }) : window.setTimeout(fn, 200);
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    if (hasIdle) window.cancelIdleCallback(id);
    else window.clearTimeout(id);
  };
};

/**
 * Chibi Joshua, animated from a sprite sheet. He jumps in when he pops up, runs after the cursor
 * inside the box, waves when you point at him, and now and then checks his tablet, plays the
 * drums or takes a photo. The cartoon stands in until the sheet has loaded, or if it can't.
 */
export function SpriteAvatar({ look, onReady, active = false, className = "" }: AvatarModelProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const spriteRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const readyRef = useRef(onReady);
  const wave = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    readyRef.current = onReady;
  });

  useEffect(() => {
    let cancelled = false;
    const cancelIdle = whenIdle(() => {
      const img = new Image();
      img.src = SHEET_URL;
      img
        .decode()
        .then(() => !cancelled && setReady(true))
        .catch(() => !cancelled && setFailed(true))
        .finally(() => !cancelled && readyRef.current?.());
    });
    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const sprite = spriteRef.current;
    if (!ready || !layer || !sprite) return;

    const show = (frame: number) => {
      const { x, y } = sheetPosition(frame);
      sprite.style.backgroundPosition = `${x}% ${y}%`;
    };
    const place = (pos: number) => {
      layer.style.transform = `translateX(${(pos * RANGE * 100).toFixed(2)}%)`;
    };

    if (reduceMotion || !active) {
      show(clips.idle.start);
      place(0);
      wave.current = () => {};
      return;
    }

    let pos = 0;
    let clip: ClipName = "jump";
    let clipStart = performance.now();
    let stillSince = clipStart;
    let last = clipStart;
    let shown = -1;
    let frame = 0;
    let onScreen = true;
    let wantsWave = false;
    let target = 0;
    let lastInput = -Infinity;
    let nextWander = 0;

    // He runs to sit under the cursor (or a finger), measured across the box he lives in.
    const box = layer.parentElement ?? layer;
    const onPointer = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      target = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * RANGE));
      lastInput = performance.now();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

    const play = (name: ClipName, now = performance.now()) => {
      clip = name;
      clipStart = now;
    };
    // If he's busy running or jumping, he waves as soon as he stops.
    wave.current = () => {
      wantsWave = true;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { loop } = clips[clip];

      if (loop) {
        if (now - lastInput > WANDER_AFTER_MS && now > nextWander) {
          target = Math.random() * 1.4 - 0.7;
          nextWander = now + 7000 + Math.random() * 5000;
        }
        const step = stepToward(pos, target, dt, clip === "runLeft" || clip === "runRight");
        pos = step.pos;
        const next: ClipName = step.running > 0 ? "runRight" : step.running < 0 ? "runLeft" : "idle";
        if (next !== clip) play(next, now);
        if (next === "idle" && wantsWave) {
          play("wave", now);
          wantsWave = false;
        }
        if (next !== "idle") stillSince = now;
        else if (now - stillSince > FLOURISH_AFTER_MS) {
          play(flourishes[Math.floor(Math.random() * flourishes.length)], now);
          stillSince = now;
        }
      }

      const at = frameAt(clips[clip], now - clipStart);
      if (at.done) {
        play("idle", now);
        stillSince = now;
      }
      if (at.frame !== shown) {
        show(at.frame);
        shown = at.frame;
      }
      place(pos);
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && onScreen && !document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    observer.observe(layer);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      wave.current = () => {};
    };
  }, [ready, active, reduceMotion]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {!ready && <PlaceholderAvatar look={look} />}
      {!failed && (
        <div
          ref={layerRef}
          className={`absolute inset-0 transition-opacity duration-300 ${ready ? "" : "opacity-0"}`}
        >
          <div
            aria-hidden="true"
            className="absolute bottom-[3%] left-1/2 h-[5%] w-[34%] -translate-x-1/2 rounded-[50%] bg-black/45 blur-[3px]"
          />
          <div
            ref={spriteRef}
            aria-hidden="true"
            onPointerEnter={() => wave.current()}
            onPointerDown={() => wave.current()}
            className="absolute bottom-[4%] left-1/2 h-[88%] -translate-x-1/2 bg-no-repeat"
            style={{
              aspectRatio: `${SHEET.frameWidth} / ${SHEET.frameHeight}`,
              backgroundImage: ready ? `url(${SHEET_URL})` : undefined,
              backgroundSize: `${SHEET.columns * 100}% ${SHEET.rows * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
