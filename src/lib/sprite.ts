/**
 * The chibi Joshua sprite: which frames make up each animation, and how he moves in the box.
 * Frames are numbered in the order they sit in the sprite sheet, left to right, top to bottom.
 */

export const SHEET = { columns: 8, rows: 8, frameWidth: 250, frameHeight: 398 };

export type Clip = { start: number; count: number; fps: number; loop: boolean };

export const clips = {
  idle: { start: 0, count: 6, fps: 4, loop: true },
  runRight: { start: 6, count: 8, fps: 11, loop: true },
  runLeft: { start: 14, count: 8, fps: 11, loop: true },
  wave: { start: 22, count: 4, fps: 6, loop: false },
  jump: { start: 26, count: 5, fps: 8, loop: false },
  facepalm: { start: 31, count: 8, fps: 6, loop: false },
  waiting: { start: 39, count: 6, fps: 4, loop: false },
  drums: { start: 45, count: 6, fps: 5, loop: false },
  camera: { start: 51, count: 6, fps: 4, loop: false },
} satisfies Record<string, Clip>;

export type ClipName = keyof typeof clips;

/** Little things he does on his own after standing still for a while. */
export const flourishes: ClipName[] = ["waiting", "drums", "camera"];

/** Which sheet frame to show `ms` into a clip, and whether a one-shot clip has finished. */
export function frameAt(clip: Clip, ms: number): { frame: number; done: boolean } {
  const n = Math.floor((ms / 1000) * clip.fps);
  if (clip.loop) return { frame: clip.start + (n % clip.count), done: false };
  return { frame: clip.start + Math.min(n, clip.count - 1), done: n >= clip.count };
}

/** Where a frame sits in the sheet, as CSS background-position percentages. */
export function sheetPosition(frame: number) {
  const col = frame % SHEET.columns;
  const row = Math.floor(frame / SHEET.columns);
  return { x: (col / (SHEET.columns - 1)) * 100, y: (row / (SHEET.rows - 1)) * 100 };
}

/** He stops running once this close to where he's headed, in units of his running range. */
export const ARRIVED = 0.04;
/** And only sets off again once the target is this far away, so small cursor moves don't make him twitch. */
export const SET_OFF = 0.18;
/** Running speed, in units of his running range per second (the range is -1 to 1). */
export const SPEED = 1.6;

/** Move toward the target at running speed. Returns the new position and which way he's running, if at all. */
export function stepToward(
  pos: number,
  target: number,
  dt: number,
  wasRunning = false,
): { pos: number; running: -1 | 0 | 1 } {
  const gap = target - pos;
  if (Math.abs(gap) <= (wasRunning ? ARRIVED : SET_OFF)) return { pos, running: 0 };
  const dir = gap > 0 ? 1 : -1;
  const next = pos + dir * Math.min(Math.abs(gap), SPEED * dt);
  return { pos: next, running: dir };
}
