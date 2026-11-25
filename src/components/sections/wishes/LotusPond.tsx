import type { Wish } from "@/lib/wishes";

/** Where lamps may float, as % of the water (x, y). One per wish, at most 16. */
const SLOTS: [number, number][] = [
  [9, 38], [21, 66], [32, 34], [43, 70], [55, 40], [67, 68], [79, 36], [91, 64],
  [15, 86], [37, 88], [61, 86], [85, 88], [26, 50], [49, 56], [73, 52], [96, 42],
];
const LOTUS: [number, number, number][] = [
  [4, 62, 1], [47, 90, 0.85], [98, 78, 1.05], [62, 24, 0.75],
];
const PADS: [number, number, number, number][] = [
  [6, 72, 1.1, -20], [12, 54, 0.8, 40], [29, 78, 0.9, 120], [52, 92, 1.2, 10], [58, 30, 0.8, 200], [88, 50, 1, 70], [94, 84, 0.9, -60], [40, 44, 0.7, 160],
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/** Each wish keeps its spot on the water while others come and go. */
function assignSlots(wishes: Wish[]) {
  const taken = new Set<number>();
  const out = new Map<string, number>();
  [...wishes].reverse().forEach((w) => {
    let k = hash(w.id) % SLOTS.length;
    while (taken.has(k)) k = (k + 1) % SLOTS.length;
    taken.add(k);
    out.set(w.id, k);
  });
  return out;
}

/** A small brass diya with a flame (also used on the Send button and for the flying lamp). */
export function DiyaArt({ lit = true, className = "" }: { lit?: boolean; className?: string }) {
  return (
    <svg className={`lp-diya ${lit ? "is-lit" : ""} ${className}`} viewBox="-22 -34 44 50" aria-hidden>
      <path className="lp-diya-flame" d="M0-32C6-22 6-13 0-6-6-13-6-22 0-32Z" />
      <path className="lp-diya-core" d="M0-19C3-15 3-10 0-7-3-10-3-15 0-19Z" />
      <path d="M-18-4C-18 6-9 12 0 12S18 6 18-4Z" fill="url(#lp-brass)" stroke="#5e3c10" strokeWidth="1" />
      <ellipse cy="-4" rx="18" ry="4.2" fill="#f3d27a" stroke="#5e3c10" strokeWidth="0.9" />
      <ellipse cy="-4" rx="13" ry="2.4" fill="#7a4a12" opacity="0.5" />
    </svg>
  );
}

function Lotus({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <svg className="lp-lotus" viewBox="-30 -26 60 34" style={{ left: `${x}%`, top: `${y}%`, ["--s" as string]: s }} aria-hidden>
      <ellipse cy="4" rx="26" ry="5" fill="#2f5a3a" opacity="0.85" />
      <g stroke="#b2456a" strokeWidth="0.8">
        <path d="M0-4C-14-4-24-10-26-14-16-16-6-10 0-4Z" fill="#f0a9c0" />
        <path d="M0-4C14-4 24-10 26-14 16-16 6-10 0-4Z" fill="#f0a9c0" />
        <path d="M0-2C-10-8-14-16-12-22-4-18 0-10 0-2Z" fill="#f6bfd0" />
        <path d="M0-2C10-8 14-16 12-22 4-18 0-10 0-2Z" fill="#f6bfd0" />
        <path d="M0-2C-5-10-5-18 0-24 5-18 5-10 0-2Z" fill="#fbd3df" />
      </g>
      <circle cy="-6" r="2.4" fill="#f4c542" />
    </svg>
  );
}

function Pad({ x, y, s, r }: { x: number; y: number; s: number; r: number }) {
  return (
    <svg className="lp-pad" viewBox="-20 -8 40 16" style={{ left: `${x}%`, top: `${y}%`, ["--s" as string]: s }} aria-hidden>
      <path d="M0 0L18-2A18 7 0 1 1 18 2Z" transform={`rotate(${r} 0 0) scale(1 1)`} fill="#2e5b3b" stroke="#1d3d27" strokeWidth="0.8" />
      <path d="M0 0L-14 3M0 0L-6-5M0 0L8 5" stroke="#4f8a5c" strokeWidth="0.6" fill="none" transform={`rotate(${r})`} />
    </svg>
  );
}

interface Props {
  wishes: Wish[];
  /** the guest's new lamp: hidden until the flying lamp lands */
  landingId: string | null;
  /** the lamp that just landed: a ripple spreads round it */
  rippleId: string | null;
  reduced: boolean;
  onOpen: (wish: Wish, el: HTMLElement) => void;
}

/**
 * The lower part of the Wishing Wall: still temple-pond water under a carved stone edge, with
 * lotus flowers and leaves, and one small lit lamp floating for each wish (the 16 latest). Each
 * lamp bobs with its flame reflected below; tapping one opens that wish.
 */
export function LotusPond({ wishes, landingId, rippleId, reduced, onOpen }: Props) {
  const shown = wishes.slice(0, 16);
  const slots = assignSlots(shown);
  return (
    <div className={`lp-pond ${reduced ? "is-still" : ""}`}>
      <svg width="0" height="0" className="lp-defs" aria-hidden>
        <defs>
          <linearGradient id="lp-brass" x1="0" x2="1">
            <stop offset="0" stopColor="#6b4512" />
            <stop offset="0.35" stopColor="#f3d27a" />
            <stop offset="0.6" stopColor="#c8952f" />
            <stop offset="1" stopColor="#5e3c10" />
          </linearGradient>
        </defs>
      </svg>
      <div className="lp-edge" aria-hidden />
      <div className="lp-water" aria-hidden>
        <span className="lp-ripples lp-ripples--a" />
        <span className="lp-ripples lp-ripples--b" />
        <span className="lp-shine" />
      </div>
      <div className="lp-float">
        {PADS.map(([x, y, s, r], i) => (
          <Pad key={`p${i}`} x={x} y={y} s={s} r={r} />
        ))}
        {LOTUS.map(([x, y, s], i) => (
          <Lotus key={`l${i}`} x={x} y={y} s={s} />
        ))}
        {shown.map((w, i) => {
          const [x, y] = SLOTS[slots.get(w.id) ?? i];
          return (
            <div
              key={w.id}
              data-lamp={w.id}
              className={`lp-lamp ${landingId === w.id ? "is-landing" : ""}`}
              style={{ left: `${x}%`, top: `${y}%`, ["--d" as string]: `${(-(i * 0.37) % 3).toFixed(2)}s`, ["--b" as string]: `${(2.6 + (i % 4) * 0.35).toFixed(2)}s` }}
              onClick={(e) => onOpen(w, e.currentTarget)}
              aria-hidden
            >
              {rippleId === w.id && <span className="lp-ring" />}
              <span className="lp-reflect" />
              <span className="lp-bob">
                <DiyaArt className="lp-lamp-art" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
