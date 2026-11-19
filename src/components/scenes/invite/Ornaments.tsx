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

/** A gold lotus medallion behind the "&" (sized by the parent: 1.6× the character height). */
export function LotusMedallion({ children }: { children: ReactNode }) {
  return (
    <span className="ic-amp">
      <svg aria-hidden viewBox="-20 -20 40 40" className="ic-amp-ring">
        <circle r="18.5" fill="#F7ECD3" stroke={GOLD} strokeWidth="1" />
        <circle r="15.5" fill="none" stroke={GOLD_L} strokeWidth="0.7" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M0-18.5c1.6 1.4 1.6 3 0 4.4-1.6-1.4-1.6-3 0-4.4Z" fill={GOLD} transform={`rotate(${i * 30})`} />
        ))}
      </svg>
      <span className="relative">{children}</span>
    </span>
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
