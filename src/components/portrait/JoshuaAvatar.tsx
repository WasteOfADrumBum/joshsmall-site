"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AvatarModelProps } from "./avatar";
import { PlaceholderAvatar } from "./PlaceholderAvatar";

const MODEL_URL = "/models/chibi.glb";

const canUseWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};

/** Run after the page has loaded and the browser is idle, so three.js never competes with first paint. */
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
 * Chibi Joshua in 3D, rendered with three.js. Until it's ready, and on devices without WebGL or if
 * the model can't load, the cartoon stands in. Rendering
 * pauses when the portrait is off screen or the tab is hidden.
 */
export function JoshuaAvatar({ look, onReady, className = "" }: AvatarModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const still = useRef(false);
  const readyRef = useRef(onReady);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    still.current = !!reduceMotion;
    readyRef.current = onReady;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!canUseWebGL()) {
      readyRef.current?.();
      return;
    }

    let cancelled = false;
    let dispose = () => {};
    const cancelIdle = whenIdle(() => {
      import("./three/chibiScene")
        .then(({ loadChibiScene }) => loadChibiScene(canvas, MODEL_URL))
        .then((scene) => {
          if (cancelled) {
            scene.dispose();
            return;
          }
          let frame = 0;
          let onScreen = true;

          const draw = (t: number) => scene.render(look.current, t, still.current);
          const tick = (t: number) => {
            draw(t);
            frame = requestAnimationFrame(tick);
          };
          const start = () => {
            if (!frame && onScreen && !document.hidden) frame = requestAnimationFrame(tick);
          };
          const stop = () => {
            cancelAnimationFrame(frame);
            frame = 0;
          };
          const size = () => {
            const { width, height } = canvas.getBoundingClientRect();
            if (width && height) scene.resize(Math.round(width), Math.round(height));
            draw(performance.now());
          };

          const resizer = new ResizeObserver(size);
          resizer.observe(canvas);
          const observer = new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            if (onScreen) start();
            else stop();
          });
          observer.observe(canvas);
          const onVisibility = () => (document.hidden ? stop() : start());
          document.addEventListener("visibilitychange", onVisibility);

          size();
          start();
          setReady(true);
          readyRef.current?.();

          dispose = () => {
            stop();
            resizer.disconnect();
            observer.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            scene.dispose();
          };
        })
        .catch(() => {
          if (!cancelled) readyRef.current?.();
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      dispose();
    };
  }, [look]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <PlaceholderAvatar look={look} className={`transition-opacity duration-500 ${ready ? "opacity-0" : ""}`} />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${ready ? "" : "opacity-0"}`}
      />
    </div>
  );
}
