import { useEffect, useRef, useState } from "react";

/*
 * The RSVP's side decoration, behind everything and never over the content.
 *  - Wide screens: a panel each side (mirrored), between the kolam frame and the screen edge —
 *    strings of jasmine and marigold hanging from the top and a tall brass oil lamp on a
 *    stand at the bottom with a soft warm glow, all over a faint dot-kolam grid. They fade
 *    and rise in when the section comes on screen; on accept the lamps flare brighter.
 *  - Phones and tablets: one jasmine string down each screen edge and a small lamp in each
 *    bottom corner.
 */

/* ── a tall brass kuthu vilakku (oil lamp on a stand) with four flames ── */
function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="rs-flame" d="M0-26C7-15 7-6 0 0-7-6-7-15 0-26Z" />
      <path className="rs-flame-core" d="M0-13C3-8 3-3 0 0-3-3-3-8 0-13Z" />
    </g>
  );
}

function Lamp({ id }: { id: string }) {
  const g = `url(#${id})`;
  return (
    <svg className="rs-lamp-svg" viewBox="0 0 140 420" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#6b4512" />
          <stop offset="0.3" stopColor="#f3d27a" />
          <stop offset="0.55" stopColor="#c8952f" />
          <stop offset="1" stopColor="#5e3c10" />
        </linearGradient>
      </defs>
      {/* the finial rising from the bowl */}
      <path d="M70 8C76 16 80 24 80 32C80 40 75 44 70 44S60 40 60 32C60 24 64 16 70 8Z" fill={g} stroke="#5e3c10" strokeWidth="1" />
      <rect x="66" y="44" width="8" height="54" fill={g} />
      <ellipse cx="70" cy="60" rx="9" ry="3" fill={g} />
      <ellipse cx="70" cy="80" rx="8" ry="3" fill={g} />
      {/* the bowl with its wicks */}
      <path d="M12 100Q70 150 128 100Z" fill={g} stroke="#5e3c10" strokeWidth="1" />
      <ellipse cx="70" cy="100" rx="58" ry="9" fill="#f3d27a" stroke="#5e3c10" strokeWidth="1" />
      <ellipse cx="70" cy="100" rx="50" ry="6" fill="#7a4a12" opacity="0.55" />
      <Flame x={20} y={99} />
      <Flame x={47} y={104} s={1.1} />
      <Flame x={93} y={104} s={1.1} />
      <Flame x={120} y={99} />
      {/* the stem with its rings */}
      <path d="M64 124H76V332H64Z" fill={g} />
      {[140, 176, 214, 252, 290].map((y, i) => (
        <g key={y}>
          <ellipse cx="70" cy={y} rx={i % 2 ? 11 : 14} ry="4" fill={g} stroke="#5e3c10" strokeWidth="0.6" />
          {i % 2 === 0 && <ellipse cx="70" cy={y + 10} rx="9" ry="6" fill={g} />}
        </g>
      ))}
      {/* the base */}
      <path d="M70 326C60 356 32 378 16 398H124C108 378 80 356 70 326Z" fill={g} stroke="#5e3c10" strokeWidth="1" />
      <ellipse cx="70" cy="400" rx="58" ry="9" fill={g} stroke="#5e3c10" strokeWidth="1" />
      <ellipse cx="70" cy="408" rx="62" ry="7" fill={g} stroke="#5e3c10" strokeWidth="1" />
    </svg>
  );
}

/* ── jasmine and marigold strings ── */
function GarlandDefs() {
  return (
    <svg className="rs-defs" aria-hidden width="0" height="0">
      <defs>
        <radialGradient id="rs-mari" cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#ffc24a" />
          <stop offset="0.6" stopColor="#f2890f" />
          <stop offset="1" stopColor="#c45808" />
        </radialGradient>
        <g id="rs-bud">
          <ellipse rx="3.2" ry="6" fill="#fffdf6" stroke="#e6dcc2" strokeWidth="0.6" />
          <path d="M-1.6 5.2L0 8 1.6 5.2Z" fill="#8aa05a" />
        </g>
        <g id="rs-marigold">
          <circle r="10" fill="url(#rs-mari)" />
          <circle r="7" fill="none" stroke="#ffd36b" strokeWidth="2" strokeDasharray="2 2.2" />
          <circle r="3.6" fill="#b4520a" />
        </g>
        {/* marigold, then a cluster of jasmine buds */}
        <pattern id="rs-mix" width="26" height="46" patternUnits="userSpaceOnUse">
          <line x1="13" y1="0" x2="13" y2="46" stroke="#e9dfc6" strokeWidth="0.8" />
          <use href="#rs-marigold" x="13" y="11" />
          <use href="#rs-bud" x="8.5" y="29" transform="rotate(-22 8.5 29)" />
          <use href="#rs-bud" x="17.5" y="29" transform="rotate(22 17.5 29)" />
          <use href="#rs-bud" x="13" y="36" />
        </pattern>
        {/* mostly jasmine, a marigold now and then */}
        <pattern id="rs-jas" width="26" height="64" patternUnits="userSpaceOnUse">
          <line x1="13" y1="0" x2="13" y2="64" stroke="#e9dfc6" strokeWidth="0.8" />
          <use href="#rs-bud" x="9" y="8" transform="rotate(-24 9 8)" />
          <use href="#rs-bud" x="17" y="8" transform="rotate(24 17 8)" />
          <use href="#rs-bud" x="13" y="16" />
          <use href="#rs-bud" x="9" y="27" transform="rotate(-24 9 27)" />
          <use href="#rs-bud" x="17" y="27" transform="rotate(24 17 27)" />
          <use href="#rs-bud" x="13" y="35" />
          <use href="#rs-marigold" x="13" y="52" />
        </pattern>
        {/* the narrow string down a phone's edge: jasmine only */}
        <pattern id="rs-edge" width="14" height="17" patternUnits="userSpaceOnUse">
          <line x1="7" y1="0" x2="7" y2="17" stroke="#e9dfc6" strokeWidth="0.6" />
          <use href="#rs-bud" x="4" y="6" transform="rotate(-26 4 6) scale(0.8)" />
          <use href="#rs-bud" x="10" y="6" transform="rotate(26 10 6) scale(0.8)" />
          <use href="#rs-bud" transform="translate(7 12) scale(0.8)" />
        </pattern>
      </defs>
    </svg>
  );
}

function Garland({ kind, left, height, i }: { kind: "mix" | "jas"; left: string; height: string; i: number }) {
  return (
    <span className="rs-garland" style={{ left, height, animationDuration: `${(4.6 + (i % 3) * 1.1).toFixed(1)}s`, animationDelay: `${(-i * 1.7).toFixed(1)}s` }}>
      <svg width="26" height="100%" aria-hidden>
        <rect width="26" height="100%" fill={`url(#rs-${kind})`} />
      </svg>
      <span className="rs-tassel" />
    </span>
  );
}

// five strings of different lengths, the longest reaching 55% of the section (100% of this box)
const STRINGS: { kind: "mix" | "jas"; left: string; height: string }[] = [
  { kind: "mix", left: "10%", height: "100%" },
  { kind: "jas", left: "28%", height: "64%" },
  { kind: "mix", left: "47%", height: "82%" },
  { kind: "jas", left: "66%", height: "48%" },
  { kind: "mix", left: "84%", height: "72%" },
];

function SidePanel({ side }: { side: "l" | "r" }) {
  return (
    <div className={`rs-side rs-side--${side}`} aria-hidden>
      <div className="rs-garlands">
        {STRINGS.map((s, i) => (
          <Garland key={i} {...s} i={i + (side === "r" ? 2 : 0)} />
        ))}
      </div>
      <div className="rs-lamp">
        <span className="rs-lamp-glow" />
        <Lamp id={`rs-brass-${side}`} />
      </div>
    </div>
  );
}

/** `variant="wall"`: the Wishing Wall's sides (no phone edge strings there). */
export function RsvpSides({ lit, variant }: { lit: boolean; variant?: "wall" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // the panels fade and rise in the first time the section is on screen
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setInView(true);
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rs-sides ${variant ? `rs-sides--${variant}` : ""} ${inView ? "is-in" : ""} ${lit ? "is-lit" : ""}`} aria-hidden>
      <GarlandDefs />
      <SidePanel side="l" />
      <SidePanel side="r" />
      {/* phones and tablets */}
      <span className="rs-edge rs-edge--l">
        <svg width="14" height="100%">
          <rect width="14" height="100%" fill="url(#rs-edge)" />
        </svg>
      </span>
      <span className="rs-edge rs-edge--r">
        <svg width="14" height="100%">
          <rect width="14" height="100%" fill="url(#rs-edge)" />
        </svg>
      </span>
      <span className="rs-mini rs-mini--l">
        <span className="rs-lamp-glow" />
        <Lamp id="rs-brass-ml" />
      </span>
      <span className="rs-mini rs-mini--r">
        <span className="rs-lamp-glow" />
        <Lamp id="rs-brass-mr" />
      </span>
    </div>
  );
}
