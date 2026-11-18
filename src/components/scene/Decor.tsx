import { forwardRef, type CSSProperties } from "react";

/**
 * Code-made scene decorations (inline SVG, no filters): soft clouds, falling
 * leaves and petals. Softness comes from radial gradients, never blur.
 */

let uid = 0;

/** A soft white cloud: overlapping puffs with feathered gradient edges. */
export const Cloud = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; opacity?: number }>(function Cloud(
  { className = "", style, opacity = 0.95 },
  ref,
) {
  const id = `cl${uid++}`;
  return (
    <div ref={ref} data-layer aria-hidden className={`pointer-events-none absolute ${className}`} style={style}>
      <svg viewBox="0 0 240 110" className="h-full w-full overflow-visible" style={{ opacity }}>
        <defs>
          <radialGradient id={id}>
            <stop offset="0%" stopColor="#fff" />
            <stop offset="62%" stopColor="#fff" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g fill={`url(#${id})`}>
          <ellipse cx="62" cy="72" rx="56" ry="36" />
          <ellipse cx="108" cy="50" rx="52" ry="44" />
          <ellipse cx="156" cy="58" rx="48" ry="38" />
          <ellipse cx="190" cy="76" rx="46" ry="30" />
          <ellipse cx="124" cy="82" rx="92" ry="28" />
        </g>
      </svg>
    </div>
  );
});

/** A small yellow-green leaf. */
export const Leaf = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; tone?: number }>(function Leaf(
  { className = "", style, tone = 0 },
  ref,
) {
  const fills = ["#c9d630", "#a8c23a", "#e2d84a", "#8fb43a"];
  return (
    <div ref={ref} data-layer aria-hidden className={`pointer-events-none absolute left-0 top-0 ${className}`} style={style}>
      <svg viewBox="0 0 24 34" className="h-full w-full">
        <path d="M12 1C20 8 22 18 12 33 2 18 4 8 12 1Z" fill={fills[tone % fills.length]} />
        <path d="M12 4v27" stroke="#6f8a22" strokeWidth="1" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
});

/** A flower petal (marigold, rose or jasmine). */
export const Petal = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; tone?: number }>(function Petal(
  { className = "", style, tone = 0 },
  ref,
) {
  const fills = ["#f2a42c", "#d9463e", "#fff6e6", "#f7c64a", "#e86a84"];
  return (
    <div ref={ref} data-layer aria-hidden className={`pointer-events-none absolute left-0 top-0 ${className}`} style={style}>
      <svg viewBox="0 0 20 26" className="h-full w-full">
        <path d="M10 1C17 5 19 14 10 25 1 14 3 5 10 1Z" fill={fills[tone % fills.length]} />
        <path d="M10 5c2 4 2 9 0 15" stroke="rgb(0 0 0 / 0.12)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
});

/** Stable pseudo-random numbers so layouts don't jump between renders. */
export const rand = (i: number, salt = 1) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
