import { forwardRef, type CSSProperties } from "react";

/**
 * Code-made scene decorations (inline SVG, no filters): the one cloud style,
 * falling leaves and petals.
 */

/**
 * The one cloud style: a crisp, flat white cloud (a single solid silhouette,
 * flat base, no gradients or soft edges). Always placed behind the temple and
 * arch layers. `opacity` is kept for compatibility but clouds stay solid.
 */
export const Cloud = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; opacity?: number }>(function Cloud(
  { className = "", style },
  ref,
) {
  return (
    <div ref={ref} data-layer aria-hidden className={`pointer-events-none absolute ${className}`} style={style}>
      <svg viewBox="0 0 240 100" preserveAspectRatio="xMidYMax meet" className="h-full w-full overflow-visible">
        <path
          fill="#ffffff"
          d="M18 96h204a18 18 0 0 0 0-36 26 26 0 0 0-30-22 38 38 0 0 0-70-14 30 30 0 0 0-50 22 22 22 0 0 0-24 18A16 16 0 0 0 18 96Z"
        />
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
