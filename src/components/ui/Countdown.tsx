import { useEffect, useRef, useState } from "react";
import { useSfxOnView } from "@/hooks/useSfxOnView";

function left(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const two = (n: number) => String(n).padStart(2, "0");

/**
 * 4-column arched countdown tiles matching Shubh weds Ayushi reference.
 */
export function Countdown({ iso, className = "" }: { iso: string; className?: string }) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState(() => left(target));
  const tiles = useRef<HTMLDivElement>(null);
  // four little tinks climbing the scale as the tiles come into view
  useSfxOnView(tiles, [
    ["tink", { volume: 0.55 }],
    ["tink", { volume: 0.5, rate: 1.122, delay: 0.13 }],
    ["tink", { volume: 0.5, rate: 1.26, delay: 0.26 }],
    ["tink", { volume: 0.55, rate: 1.498, delay: 0.39 }],
  ], { threshold: 0.9 });

  useEffect(() => {
    const id = window.setInterval(() => setT(left(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const cells: [number, string][] = [
    [t.days, "Days"],
    [t.hours, "Hours"],
    [t.minutes, "Minutes"],
    [t.seconds, "Seconds"],
  ];

  return (
    <div ref={tiles} className={`gn-tiles ${className}`} role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes to go`}>
      {cells.map(([v, label]) => (
        <div key={label}>
          <b key={v} className="gn-tick">{two(v)}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

