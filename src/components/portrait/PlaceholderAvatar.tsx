import type { AvatarModelProps } from "./avatar";

const hair = "#5a3f2e";
const beard = "#6a4a35";
const skin = "#e7b08b";
const skinShade = "#c98d68";
const hoodie = "#1b1b22";
const hoodieEdge = "#2a2a34";
const frames = "#0b0b0f";

/**
 * Stand-in for the real 3D model: a flat cartoon built from layers. The head turns in CSS 3D and
 * its features slide further than its outline, which reads as depth. Pose comes from the --lx and
 * --ly variables the stage sets each frame, so following the cursor never re-renders React.
 */
export function PlaceholderAvatar({ className = "" }: AvatarModelProps) {
  return (
    <div className={`av-breathe absolute inset-0 ${className}`}>
      <svg
        viewBox="0 0 280 190"
        className="av-body absolute -bottom-[12%] left-[4%] w-[92%]"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M116 18h48v46h-48z" fill={skinShade} />
        <path d="M18 190Q18 70 92 52h96q74 18 74 138z" fill={hoodie} />
        <path d="M88 54q52 50 104 0q-22-16-52-16t-52 16z" fill={hoodieEdge} />
        <path d="M121 84l-3 38M159 84l3 38" stroke="#77737d" strokeWidth="3" strokeLinecap="round" />
        <circle cx="117.5" cy="124" r="3.5" fill="#77737d" />
        <circle cx="162.5" cy="124" r="3.5" fill="#77737d" />
      </svg>

      <svg
        viewBox="0 0 160 240"
        className="av-head absolute left-1/4 top-[22%] w-1/2"
        aria-hidden="true"
        focusable="false"
      >
        <g className="av-back">
          <circle cx="80" cy="20" r="17" fill={hair} />
          <ellipse cx="28" cy="94" rx="9" ry="14" fill={skinShade} />
          <ellipse cx="132" cy="94" rx="9" ry="14" fill={skinShade} />
        </g>

        <ellipse cx="80" cy="90" rx="52" ry="60" fill={skin} />
        <path d="M28 84Q26 28 80 28t52 56q-14-32-52-34t-52 34z" fill={hair} />

        <g className="av-front">
          <path
            d="M30 96q2 74 28 108q22 30 44 0q26-34 28-108q-10 28-30 32q-20-8-40 0q-20-4-30-32z"
            fill={beard}
          />
          <path d="M72 133q8 6 16 0" fill="none" stroke="#2a1a14" strokeWidth="3" strokeLinecap="round" />
          <path d="M54 129q14-12 26-4q12-8 26 4q-13-4-26 0q-13-4-26 0z" fill={hair} />
          <path d="M80 94q7 11 0 16" fill="none" stroke={skinShade} strokeWidth="3" strokeLinecap="round" />
          <path d="M48 70q10-6 22-2M90 68q12-4 22 2" fill="none" stroke={hair} strokeWidth="4" strokeLinecap="round" />

          <g className="av-blink">
            <g className="av-pupils">
              <circle cx="60" cy="86" r="4.5" fill={frames} />
              <circle cx="100" cy="86" r="4.5" fill={frames} />
            </g>
          </g>

          <rect x="43" y="74" width="34" height="25" rx="8" fill="rgb(255 255 255 / 0.1)" stroke={frames} strokeWidth="4" />
          <rect x="83" y="74" width="34" height="25" rx="8" fill="rgb(255 255 255 / 0.1)" stroke={frames} strokeWidth="4" />
          <path d="M77 84h6M43 82l-14-4M117 82l14-4" stroke={frames} strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
