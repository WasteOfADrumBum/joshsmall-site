import type { ComponentType, RefObject } from "react";
import type { Look } from "@/lib/look";
import { SpriteAvatar } from "./SpriteAvatar";

export type AvatarModelProps = {
  /** Where the character is looking right now, eased, updated every frame. */
  look: RefObject<Look>;
  /** Called once the model can be shown, so the pop waits for the real thing rather than a loading state. */
  onReady?: () => void;
  /** True while the character is the view on show; it animates only then. */
  active?: boolean;
  className?: string;
};

/**
 * The model slot. `SpriteAvatar` animates chibi Joshua from a sprite sheet, loaded only after the
 * page is idle, with `PlaceholderAvatar` (the flat cartoon) standing in until then. A model can
 * also skip `look` and read the --lx / --ly CSS variables, like the cartoon does.
 */
export const AvatarModel: ComponentType<AvatarModelProps> = SpriteAvatar;
