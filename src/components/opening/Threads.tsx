import { forwardRef, useId } from "react";

interface ThreadsProps {
  width: number;
  height: number;
  colors: [string, string];
}

/** Knot size relative to viewport width: ~2.1 on a 390px phone, capped on desktop. */
export const knotScale = (w: number) => Math.min(Math.max(w / 185, 1.8), 2.8);

/** Points are mirrored through the centre so the two loops interlock into a knot. */
function geometry(w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const s = knotScale(w);
  const p = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const rot = (x: number, y: number) => p(2 * cx - x, 2 * cy - y);

  // Left thread: hangs from the left edge with a soft sag, then loops.
  const left = [
    `M${p(-8, cy - h * 0.09)}`,
    `C${p(w * 0.22, cy + h * 0.1)} ${p(cx - 70 * s, cy + 14 * s)} ${p(cx - 18 * s, cy)}`,
    `C${p(cx - 4 * s, cy - 22 * s)} ${p(cx + 14 * s, cy - 10 * s)} ${p(cx + 4 * s, cy + 2 * s)}`,
    `C${p(cx - 4 * s, cy + 10 * s)} ${p(cx - 12 * s, cy + 4 * s)} ${p(cx - 6 * s, cy - 4 * s)}`,
  ].join(" ");

  // Right thread: mirrored sag from the right edge, loop rotated 180° to interlock.
  const right = [
    `M${p(w + 8, cy - h * 0.09)}`,
    `C${p(w - w * 0.22, cy + h * 0.1)} ${p(cx + 70 * s, cy - 14 * s)} ${p(cx + 18 * s, cy)}`,
    `C${rot(cx - 4 * s, cy - 22 * s)} ${rot(cx + 14 * s, cy - 10 * s)} ${rot(cx + 4 * s, cy + 2 * s)}`,
    `C${rot(cx - 4 * s, cy + 10 * s)} ${rot(cx - 12 * s, cy + 4 * s)} ${rot(cx - 6 * s, cy - 4 * s)}`,
  ].join(" ");

  return { left, right, cx, cy, s };
}

/**
 * Two wedding threads (turmeric + kumkum by default). Each is revealed by a
 * mask stroke with pathLength=1, so the draw animation is resize-proof:
 * animate `.thread-draw` strokeDashoffset 1 → 0 to draw, 0 → 1 to retract.
 */
export const Threads = forwardRef<SVGSVGElement, ThreadsProps>(function Threads({ width, height, colors }, ref) {
  const uid = useId().replace(/:/g, "");
  const { left, right, cx, cy, s } = geometry(width, height);
  const threads = [
    { d: left, color: colors[0], id: `${uid}l` },
    { d: right, color: colors[1], id: `${uid}r` },
  ];

  return (
    <svg
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${uid}g`}>
          <stop offset="0%" stopColor="#ffe7a8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#f3c25a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f3c25a" stopOpacity="0" />
        </radialGradient>
        {threads.map((t) => (
          <mask id={t.id} key={t.id} maskUnits="userSpaceOnUse" x={-20} y={-20} width={width + 40} height={height + 40}>
            <path
              className="thread-draw"
              d={t.d}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={7 * s}
              strokeDasharray="1 1"
              strokeDashoffset={1}
            />
          </mask>
        ))}
      </defs>

      <circle className="thread-glow" cx={cx} cy={cy} r={70 * s} fill={`url(#${uid}g)`} opacity={0} />

      <g className="thread-knot" style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {threads.map((t) => (
          <g key={t.id} mask={`url(#${t.id})`}>
            {/* soft shadow */}
            <path d={t.d} fill="none" stroke="rgb(42 36 33 / 0.18)" strokeWidth={3.4 * (s / 1.4)} transform="translate(0 2)" strokeLinecap="round" />
            {/* the thread */}
            <path d={t.d} fill="none" stroke={t.color} strokeWidth={3.2 * (s / 1.4)} strokeLinecap="round" strokeLinejoin="round" />
            {/* twist highlight */}
            <path d={t.d} fill="none" stroke="#fff6dc" strokeOpacity={0.7} strokeWidth={1.1 * (s / 1.4)} strokeDasharray="2.5 4" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </svg>
  );
});
