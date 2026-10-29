"use client";

import { Box, Camera } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { type ReactNode, type RefObject, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { profile } from "@/content/site";
import { type Look, approach, idleLook, lookToward, tiltToLook } from "@/lib/look";
import { AvatarModel } from "./avatar";

type View = "photo" | "avatar";

/** Wait for the hero's own entrance to finish so visitors see the photo before it gets shoved. */
const POP_DELAY_MS = 1700;
/** How much longer the pop waits for the 3D model before showing the cartoon instead. */
const MAX_MODEL_WAIT_MS = 4000;
/** After this long with no pointer or tilt, the character looks around on its own. */
const IDLE_AFTER_MS = 4000;

const photoAt = {
  photo: { x: "0%", y: "0%", rotate: 0, scale: 1, opacity: 1 },
  avatar: { x: "-36%", y: "-36%", rotate: -14, scale: 0.38, opacity: 0.9 },
};
const avatarAt = {
  photo: { y: "105%" },
  avatar: { y: "0%" },
};

const noop = () => () => {};

/**
 * The hero portrait. It starts as the photo; the first time it is on screen a 3D "me" pops
 * up from the bottom, knocks the photo into the corner, and follows the cursor (or a finger, or
 * phone tilt). A toggle underneath switches between the two. With reduced motion there's no pop
 * and no tracking; the toggle just swaps them.
 */
export function PortraitStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const look = useRef<Look>({ x: 0, y: 0 });
  const chosen = useRef(false);
  const reduceMotion = useReducedMotion();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const inView = useInView(stageRef, { once: true, amount: 0.6 });
  const [view, setView] = useState<View>("photo");
  const [modelReady, setModelReady] = useState(false);
  const [delayDone, setDelayDone] = useState(false);

  useEffect(() => {
    if (!inView || reduceMotion !== false) return;
    const id = setTimeout(() => setDelayDone(true), POP_DELAY_MS);
    return () => clearTimeout(id);
  }, [inView, reduceMotion]);

  // Pop once the delay is over and the model is ready, or give up waiting on a slow connection.
  useEffect(() => {
    if (!delayDone || chosen.current) return;
    const id = setTimeout(
      () => {
        if (!chosen.current) setView("avatar");
      },
      modelReady ? 0 : MAX_MODEL_WAIT_MS,
    );
    return () => clearTimeout(id);
  }, [delayDone, modelReady]);

  useLookTracking(stageRef, look, view === "avatar" && reduceMotion === false);

  const onModelReady = useCallback(() => setModelReady(true), []);

  const choose = (next: View) => {
    chosen.current = true;
    setView(next);
  };

  const showingAvatar = view === "avatar";
  const instant = reduceMotion ? { duration: 0 } : undefined;

  return (
    <div>
      <div className="grad-border relative rounded-3xl p-[3px]">
        <div ref={stageRef} className="portrait-stage relative aspect-square overflow-hidden rounded-[1.3rem] bg-surface">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgb(255_176_32/0.22),transparent_65%)]"
          />
          <motion.div
            initial={false}
            animate={photoAt[view]}
            transition={instant ?? { type: "spring", stiffness: 240, damping: 18, delay: showingAvatar ? 0.12 : 0.1 }}
            aria-hidden={showingAvatar}
            className={`absolute inset-0 overflow-hidden rounded-[1.3rem] ${showingAvatar ? "shadow-2xl shadow-black/70" : ""}`}
          >
            <Image
              src={profile.photo}
              alt={profile.photoAlt}
              width={profile.photoSize}
              height={profile.photoSize}
              priority
              sizes="280px"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={false}
            animate={avatarAt[view]}
            transition={instant ?? { type: "spring", stiffness: 210, damping: showingAvatar ? 14 : 24 }}
            role="img"
            aria-label={profile.avatarAlt}
            aria-hidden={!showingAvatar}
            className="absolute inset-0"
          >
            <AvatarModel look={look} onReady={onModelReady} />
          </motion.div>
        </div>
      </div>

      {/* Space is reserved before the toggle hydrates, so nothing below it moves. */}
      <div className="mt-4 flex h-10 justify-center">
        {hydrated && (
          <div
            role="group"
            aria-label="Portrait view"
            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface/70 p-1 text-sm"
          >
            <ToggleButton pressed={!showingAvatar} onClick={() => choose("photo")}>
              <Camera aria-hidden="true" size={14} /> My photo
            </ToggleButton>
            <ToggleButton pressed={showingAvatar} onClick={() => choose("avatar")}>
              <Box aria-hidden="true" size={14} /> 3D me
            </ToggleButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-semibold transition-colors ${
        pressed ? "bg-accent text-bg" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Eases the character toward the pointer, a touch, or phone tilt, and writes the pose to --lx/--ly
 * on the stage. Runs only while active, on screen, and in a visible tab.
 */
function useLookTracking(stageRef: RefObject<HTMLDivElement | null>, look: RefObject<Look>, active: boolean) {
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
