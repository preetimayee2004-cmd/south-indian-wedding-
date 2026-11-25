import type { Wish } from "@/lib/wishes";

/**
 * Where lamps stand, as % of the lamp area (x, y): two loose rows, a little uneven. One lamp per
 * wish, at most 16; the order spreads the first few across both rows.
 */
const SLOTS: [number, number][] = [
  [10, 30], [58, 74], [34, 28], [82, 72], [22, 72], [70, 32], [46, 70], [92, 34],
  [7, 76], [52, 34], [28, 76], [76, 28], [16, 34], [64, 76], [40, 74], [88, 30],
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/** Each wish keeps its spot while others come and go. */
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
      <defs>
        <linearGradient id="lp-brass" x1="0" x2="1">
          <stop offset="0" stopColor="#6b4512" />
          <stop offset="0.35" stopColor="#f3d27a" />
          <stop offset="0.6" stopColor="#c8952f" />
          <stop offset="1" stopColor="#5e3c10" />
        </linearGradient>
      </defs>
      <path className="lp-diya-flame" d="M0-32C6-22 6-13 0-6-6-13-6-22 0-32Z" />
      <path className="lp-diya-core" d="M0-19C3-15 3-10 0-7-3-10-3-15 0-19Z" />
      <path d="M-18-4C-18 6-9 12 0 12S18 6 18-4Z" fill="url(#lp-brass)" stroke="#5e3c10" strokeWidth="1" />
      <ellipse cy="-4" rx="18" ry="4.2" fill="#f3d27a" stroke="#5e3c10" strokeWidth="0.9" />
      <ellipse cy="-4" rx="13" ry="2.4" fill="#7a4a12" opacity="0.5" />
    </svg>
  );
}

interface Props {
  wishes: Wish[];
  /** the guest's new lamp: hidden until the flying lamp lands */
  landingId: string | null;
  /** the lamp that just landed: a soft ring of light spreads round it */
  rippleId: string | null;
  reduced: boolean;
  onOpen: (wish: Wish, el: HTMLElement) => void;
}

/**
 * The bottom of the Wishing Wall: one small lit lamp for each wish (the 16 latest), in two loose
 * rows on the maroon, each with a soft warm glow under it and a gentle flicker. Tapping a lamp
 * opens that wish.
 */
export function LampField({ wishes, landingId, rippleId, reduced, onOpen }: Props) {
  const shown = wishes.slice(0, 16);
  const slots = assignSlots(shown);
  return (
    <div className={`lf-field ${reduced ? "is-still" : ""}`}>
      {shown.map((w, i) => {
        const [x, y] = SLOTS[slots.get(w.id) ?? i];
        return (
          <div
            key={w.id}
            data-lamp={w.id}
            className={`lf-lamp ${landingId === w.id ? "is-landing" : ""}`}
            style={{ left: `${x}%`, top: `${y}%`, ["--d" as string]: `${(-(i * 0.37) % 3).toFixed(2)}s` }}
            onClick={(e) => onOpen(w, e.currentTarget)}
            aria-hidden
          >
            <span className="lf-glow" />
            {rippleId === w.id && <span className="lf-ring" />}
            <DiyaArt className="lp-lamp-art" />
          </div>
        );
      })}
    </div>
  );
}
