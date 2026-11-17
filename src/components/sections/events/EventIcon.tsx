import type { CSSProperties, ReactElement } from "react";
import type { EventIcon as IconName } from "@/config/types";

/** Thin line icons drawn from temple objects. Stroke inherits currentColor. */
const PATHS: Record<IconName, ReactElement> = {
  diya: (
    <>
      <path d="M24 9c3 4 4 6.5 4 8.5a4 4 0 0 1-8 0c0-2 1-4.5 4-8.5Z" />
      <path d="M8 26h32c-1.5 6-7.5 10-16 10S9.5 32 8 26Z" />
      <path d="M14 36l-2 4h24l-2-4" />
    </>
  ),
  kalash: (
    <>
      <path d="M17 18c-4 3-6 7-6 11 0 6 6 10 13 10s13-4 13-10c0-4-2-8-6-11Z" />
      <path d="M17 18h14M19 14h10v4H19z" />
      <path d="M24 14c-3-3-7-4-10-3M24 14c3-3 7-4 10-3M24 14V7" />
      <circle cx="24" cy="6" r="2.2" />
    </>
  ),
  garland: (
    <>
      <path d="M6 10c4 18 32 18 36 0" />
      {[10, 15, 21, 27, 33, 38].map((x, i) => (
        <circle key={x} cx={x} cy={[16, 21, 24, 24, 21, 16][i]} r="2.4" />
      ))}
      <path d="M24 26v8M21 37a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
    </>
  ),
  agni: (
    <>
      <path d="M24 8c5 6 9 10 9 16a9 9 0 0 1-18 0c0-4 2-6 4-8 0 3 1 5 3 5-1-5 0-9 2-13Z" />
      <path d="M10 36h28M13 40h22M12 36l3-4h18l3 4" />
    </>
  ),
};

export function EventIcon({ name, className = "", style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {PATHS[name]}
    </svg>
  );
}
