import type { ReactNode } from "react";

/** Gold ornaments for the invitation card in the arch (all inline SVG, decorative). */

const GOLD = "#B8893E";
const GOLD_L = "#E8C56B";

/** A small kalasam: brass pot with mango leaves and a coconut. */
export function Kalasam({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 44" className={className}>
      <defs>
        <linearGradient id="kl-g" x1="0" x2="1">
          <stop offset="0" stopColor={GOLD} />
          <stop offset="0.5" stopColor={GOLD_L} />
          <stop offset="1" stopColor={GOLD} />
        </linearGradient>
      </defs>
      {/* coconut */}
      <path d="M20 2c4 0 6.5 3.4 6.5 7.2H13.5C13.5 5.4 16 2 20 2Z" fill="url(#kl-g)" stroke={GOLD} strokeWidth="0.8" />
      {/* mango leaves */}
      <path d="M13 11c-4-.4-7.5 1-9 3.6 3.6.6 6.8-.3 9-3.6Zm14 0c4-.4 7.5 1 9 3.6-3.6.6-6.8-.3-9-3.6ZM16.5 11c-2.2 1.4-3.3 3.6-3 6 2-1.3 3-3.5 3-6Zm7 0c2.2 1.4 3.3 3.6 3 6-2-1.3-3-3.5-3-6Z" fill="url(#kl-g)" />
      {/* rim and pot */}
      <rect x="12" y="10" width="16" height="3" rx="1.5" fill="url(#kl-g)" stroke={GOLD} strokeWidth="0.6" />
      <path d="M14 13c-6 3-8.5 8-8.5 13 0 7.5 6.5 12 14.5 12s14.5-4.5 14.5-12c0-5-2.5-10-8.5-13Z" fill="url(#kl-g)" stroke={GOLD} strokeWidth="0.8" />
      <path d="M8 24h24M7 29h26" stroke="#7A1F2B" strokeOpacity="0.45" strokeWidth="0.9" />
      {/* foot */}
      <path d="M15 38h10l2 4H13Z" fill="url(#kl-g)" stroke={GOLD} strokeWidth="0.6" />
    </svg>
  );
}

/** A small lotus (used in the divider and the medallion). */
function Lotus({ x, y, s, fill = GOLD }: { x: number; y: number; s: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <path d="M0-9C3-5 3.2-1.5 0 2-3.2-1.5-3-5 0-9Z" />
      <path d="M-1.4 1.8C-5.8 1.4-8.2-1.6-8.6-5.2-5-4.4-2.4-2-1.4 1.8Z" />
      <path d="M1.4 1.8C5.8 1.4 8.2-1.6 8.6-5.2 5-4.4 2.4-2 1.4 1.8Z" />
      <path d="M-9.5 2.2C-6 4.4 6 4.4 9.5 2.2 6 3.2-6 3.2-9.5 2.2Z" />
    </g>
  );
}

/** The gold flourish line with a small lotus in the centre (180px wide). */
export function LotusDivider({ className = "" }: { className?: string }) {
  return (
    <svg data-line aria-hidden viewBox="0 0 180 22" className={`block h-[22px] w-[180px] max-w-full ${className}`}>
      <g fill="none" stroke={GOLD} strokeWidth="1" strokeLinecap="round">
        <path d="M4 12H64c6 0 9-4 13-4" />
        <path d="M176 12H116c-6 0-9-4-13-4" />
        <path d="M30 12c4 0 6 3 10 3s6-3 10-3M150 12c-4 0-6 3-10 3s-6-3-10-3" strokeOpacity="0.7" />
      </g>
      <circle cx="4" cy="12" r="1.6" fill={GOLD} />
      <circle cx="176" cy="12" r="1.6" fill={GOLD} />
      <Lotus x={90} y={13} s={1} />
    </svg>
  );
}

/**
 * The "&": maroon on a gold lotus, with two thin gold threads running up to the
 * first name and down to the second, like a knot tying the names together.
 */
export function LotusMedallion({ children }: { children: ReactNode }) {
  return (
    <span className="ic-amp">
      <span aria-hidden className="ic-thread ic-thread--up" />
      <span aria-hidden className="ic-thread ic-thread--down" />
      <svg aria-hidden viewBox="-20 -20 40 40" className="ic-amp-ring">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M0-19C4.6-14 4.6-8 0-4-4.6-8-4.6-14 0-19Z" fill={i % 2 ? GOLD_L : GOLD} transform={`rotate(${i * 45})`} />
        ))}
        <circle r="11.5" fill="#F7ECD3" stroke={GOLD} strokeWidth="1" />
        <circle r="9.6" fill="none" stroke={GOLD_L} strokeWidth="0.6" />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

/** A hand-drawn gold flourish under a name (draws itself: stroke-dashoffset 1 → 0). */
export function Flourish() {
  return (
    <svg aria-hidden viewBox="0 0 240 24" className="ic-flourish">
      <path
        data-draw
        pathLength={1}
        d="M6 14c22-8 40 6 62 2s30-12 52-6c10 3 12 9 2 10-8 1-8-8 2-10 24-6 40 6 62 2s28-8 48-4"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A pulli kolam: a 4×4 grid of dots, each ringed by a loop, woven together by
 * looping lines (drawn with the scroll via stroke-dashoffset).
 */
export function Kolam({ className = "" }: { className?: string }) {
  const n = 4, g = 40, o = 60; // dots, spacing, offset
  const dots: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dots.push([o + i * g, o + j * g]);
  const last = o + (n - 1) * g;
  // a weave of S-curves between the rows and columns
  const weave: string[] = [];
  for (let k = 0; k < n - 1; k++) {
    const m = o + k * g + g / 2;
    let h = `M${o - g / 2} ${m}`, v = `M${m} ${o - g / 2}`;
    for (let i = 0; i < n; i++) {
      const c = o + i * g, s1 = i % 2 ? 12 : -12;
      h += ` Q${c} ${m + s1} ${c + g / 2} ${m}`;
      v += ` Q${m + s1} ${c} ${m} ${c + g / 2}`;
    }
    weave.push(h, v);
  }
  const R = (last - o) / 2 + g * 0.95, C = (o + last) / 2;
  const outer = `M${C} ${C - R}Q${C + R} ${C - R} ${C + R} ${C}Q${C + R} ${C + R} ${C} ${C + R}Q${C - R} ${C + R} ${C - R} ${C}Q${C - R} ${C - R} ${C} ${C - R}Z`;
  return (
    <svg aria-hidden viewBox="0 0 300 300" className={className}>
      <g fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
        {dots.map(([x, y], i) => (
          <path key={i} data-kolam pathLength={1} d={`M${x} ${y - 11}a11 11 0 1 1 -0.1 0`} />
        ))}
        {weave.map((d, i) => (
          <path key={`w${i}`} data-kolam pathLength={1} d={d} />
        ))}
        <path data-kolam pathLength={1} d={outer} />
      </g>
      <g fill={GOLD}>
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" />
        ))}
      </g>
    </svg>
  );
}

/**
 * A string of jasmine buds (white, green tips) with one red rose in the centre.
 * Each bud is a [data-bud] group, with --d = its distance from the centre (they pop in centre-out).
 */
export function JasmineDivider({ className = "" }: { className?: string }) {
  const buds = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
  return (
    <svg data-jasmine aria-hidden viewBox="-100 -14 200 28" className={`block h-[28px] w-[200px] max-w-full overflow-visible ${className}`}>
      <path d="M-96 0C-60 6-30 6-12 2M96 0C60 6 30 6 12 2" fill="none" stroke={GOLD} strokeWidth="0.9" />
      {buds.map((k) => {
        const x = k * 17, y = 4 - Math.abs(k) * 0.4;
        return (
          <g key={k} data-bud data-d={Math.abs(k)} transform={`translate(${x} ${y})`}>
            <g className="ic-bud">
              <path d="M0-7C3.4-4 3.4 2 0 4-3.4 2-3.4-4 0-7Z" fill="#fffdf6" stroke="#d8cdb4" strokeWidth="0.6" />
              <path d="M-2 3.4C-1 6 1 6 2 3.4 1 4.4-1 4.4-2 3.4Z" fill="#6c9a3c" />
            </g>
          </g>
        );
      })}
      <g data-bud data-d={0}>
        <g className="ic-bud">
          <circle r="7" fill="#b3202f" />
          <path d="M0-4.6a4.6 4.6 0 1 1-4 2.4M0-2a2 2 0 1 1-1.7 1" fill="none" stroke="#7a1020" strokeWidth="1" strokeLinecap="round" />
          <path d="M-7 5c2-3 5-3 6-1-2 2-4 2-6 1ZM7 5c-2-3-5-3-6-1 2 2 4 2 6 1Z" fill="#5d8a32" />
        </g>
      </g>
    </svg>
  );
}

/** A small gold line-art gopuram (draws itself when it comes into view). */
export function GopuramLine({ className = "" }: { className?: string }) {
  const tiers = [0, 1, 2, 3];
  return (
    <svg aria-hidden viewBox="0 0 40 48" className={className}>
      <g fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round">
        {tiers.map((t) => {
          const w = 32 - t * 6, y = 44 - t * 8, x = 20 - w / 2;
          return <path key={t} data-draw pathLength={1} d={`M${x} ${y}V${y - 7}H${x + w}V${y}M${x + 3} ${y - 7}V${y - 9}H${x + w - 3}V${y - 7}`} />;
        })}
        <path data-draw pathLength={1} d="M13 12C13 6 27 6 27 12M20 6V2M18.5 3.5h3" />
        <path data-draw pathLength={1} d="M17 44v-6a3 3 0 0 1 6 0v6M3 46h34" />
      </g>
    </svg>
  );
}

/** A tiny brass bell hanging under each countdown box. */
export function Bell() {
  return (
    <svg aria-hidden viewBox="0 0 16 18" className="cd-bell">
      <path d="M8 0v3" stroke={GOLD} strokeWidth="1" />
      <path d="M8 3c-3.4 0-5 2.6-5 6v3l-1.6 2h13.2L13 12V9c0-3.4-1.6-6-5-6Z" fill={GOLD_L} stroke={GOLD} strokeWidth="0.8" />
      <circle cx="8" cy="15.6" r="1.6" fill={GOLD} />
    </svg>
  );
}

/** "— DEAR —" style label: thin gold line and a tiny diamond each side. */
export function GoldLabel({ children, as: Tag = "p", className = "", id }: { children: ReactNode; as?: "p" | "h2" | "h3"; className?: string; id?: string }) {
  return (
    <Tag data-line id={id} className={`ic-label ${className}`}>
      <span aria-hidden className="ic-label-line" />
      <span aria-hidden className="ic-diamond" />
      <span className="ic-label-text">{children}</span>
      <span aria-hidden className="ic-diamond" />
      <span aria-hidden className="ic-label-line ic-label-line--r" />
    </Tag>
  );
}

/** A small gold location pin. */
export function Pin({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 20" className={className}>
      <path d="M8 19s-6.5-6-6.5-10.6a6.5 6.5 0 0 1 13 0C14.5 13 8 19 8 19Z" fill={GOLD} />
      <circle cx="8" cy="8.4" r="2.4" fill="#F7ECD3" />
    </svg>
  );
}
