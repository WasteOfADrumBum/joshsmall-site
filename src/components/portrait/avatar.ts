import type { ComponentType, RefObject } from "react";
import type { Look } from "@/lib/look";
import { JoshuaAvatar } from "./JoshuaAvatar";

export type AvatarModelProps = {
  /** Where the character is looking right now, eased, updated every frame. For a WebGL model to read in its own loop. */
  look: RefObject<Look>;
  /** Called once the model can be shown, so the pop waits for the real thing rather than a loading state. */
  onReady?: () => void;
  className?: string;
};

/**
 * The model slot. `JoshuaAvatar` draws a 3D bust with three.js, loaded only after the page is idle,
 * and falls back to `PlaceholderAvatar` (the flat cartoon) without WebGL. A model can also skip
 * `look` and read the --lx / --ly CSS variables, like the cartoon does.
 */
export const AvatarModel: ComponentType<AvatarModelProps> = JoshuaAvatar;
