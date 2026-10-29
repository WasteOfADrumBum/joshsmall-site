import type { ComponentType, RefObject } from "react";
import type { Look } from "@/lib/look";
import { PlaceholderAvatar } from "./PlaceholderAvatar";

export type AvatarModelProps = {
  /** Where the character is looking right now, eased, updated every frame. For a WebGL model to read in its own loop. */
  look: RefObject<Look>;
  className?: string;
};

/**
 * The model slot. Swap this for the real one when it exists, loaded only when needed so it never
 * slows the first paint, for example:
 *
 *   export const AvatarModel = dynamic(() => import("./GlbAvatar"), {
 *     ssr: false,
 *     loading: () => <PlaceholderAvatar look={...} />,
 *   });
 *
 * A model can also skip `look` and read the --lx / --ly CSS variables, like the placeholder does.
 */
export const AvatarModel: ComponentType<AvatarModelProps> = PlaceholderAvatar;
