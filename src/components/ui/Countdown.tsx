import { useEffect, useState } from "react";

function left(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** Live "counting the days" boxes: days, hours, minutes, seconds until `iso`. */
export function Countdown({ iso, className = "" }: { iso: string; className?: string }) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState(() => left(target));
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
    <div className={`grid grid-cols-4 gap-2 ${className}`} role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes to go`}>
      {cells.map(([v, label]) => (
        <div key={label} className="rounded-md border border-gold/70 bg-[#fffaf0]/80 px-1 pb-1.5 pt-2 text-center shadow-[0_2px_6px_rgb(74_40_20/0.08)]">
          <span className="block text-[clamp(1.45rem,6.4vw,2rem)] font-bold leading-none tabular-nums text-maroon">{String(v).padStart(2, "0")}</span>
          <span className="mt-1 block text-[0.56rem] font-bold uppercase tracking-[0.14em] text-ink">{label}</span>
        </div>
      ))}
    </div>
  );
}
