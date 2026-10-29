/**
 * Math for the "3D me" portrait: where the character should look, and how it eases there.
 * A look is a pair of numbers from -1 to 1: x is left to right, y is up to down.
 */

export type Look = { x: number; y: number };

type Box = { left: number; top: number; width: number; height: number };
type Size = { width: number; height: number };

export const clamp = (value: number, min = -1, max = 1) => Math.min(max, Math.max(min, value));

/**
 * Look from the center of `box` toward a point on screen. The reach is a share of the viewport,
 * but never less than the box itself, so moving around inside the box still turns the head a lot.
 */
export function lookToward(px: number, py: number, box: Box, viewport: Size): Look {
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const reachX = Math.max(box.width, viewport.width * 0.35);
  const reachY = Math.max(box.height, viewport.height * 0.35);
  return { x: clamp((px - cx) / reachX), y: clamp((py - cy) / reachY) };
}

/** Phone tilt to a look. gamma is left/right tilt, beta is front/back; most people hold a phone at about 45°. */
export function tiltToLook(beta: number, gamma: number): Look {
  return { x: clamp(gamma / 30), y: clamp((beta - 45) / 30) };
}

/** One frame of easing toward the target: current += (target - current) * factor. */
export function approach(current: Look, target: Look, factor = 0.08): Look {
  return {
    x: current.x + (target.x - current.x) * factor,
    y: current.y + (target.y - current.y) * factor,
  };
}

/** A slow look-around for when nobody is pointing at anything. `t` is in milliseconds. */
export function idleLook(t: number): Look {
  return { x: Math.sin(t / 1900) * 0.4, y: Math.sin(t / 2700) * 0.18 };
}
