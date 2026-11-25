import { useEffect, useRef, useState } from "react";
import { useSfxOnView } from "@/hooks/useSfxOnView";

function left(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const two = (n: number) => String(n).padStart(2, "0");

/** One pocket: each new value comes out as a fresh paper slip; the old slip lifts away and flies off. */
function Slip({ value, label, index }: { value: string; label: string; index: number }) {
  const [state, setState] = useState({ cur: value, prev: value, n: 0 });
  if (value !== state.cur) setState({ cur: value, prev: state.cur, n: state.n + 1 });
  return (
    <div className="cd2-cell" style={{ ["--i" as string]: index }}>
      <div className="cd2-slot">
        {state.n > 0 && (
          <span key={`o${state.n}`} className="cd2-slip cd2-slip--away" aria-hidden>
            {state.prev}
          </span>
        )}
        <span key={`i${state.n}`} className={`cd2-slip ${state.n > 0 ? "cd2-slip--new" : "cd2-slip--first"}`}>
          {state.cur}
        </span>
      </div>
      <span className="cd2-pocket" aria-hidden>
        <span className="cd2-label">{label}</span>
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Counting the days, as paper slips: four maroon pockets with gold edges (Days, Hours,
 * Minutes, Seconds). As the countdown comes into view the slips come out of their pockets
 * one after another; then every time a number changes the old slip lifts off and flies away
 * and a fresh one comes out of the pocket — so the seconds pocket gives out a new slip every second.
 */
export function Countdown({ iso, className = "" }: { iso: string; className?: string }) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState(() => left(target));
  const [shown, setShown] = useState(false);
  const tiles = useRef<HTMLDivElement>(null);
  // an old wall clock ticks as the tiles come into view
  useSfxOnView(tiles, [["tick", { volume: 0.8 }]], { threshold: 0.9, rootMargin: "0px" });

  useEffect(() => {
    const id = window.setInterval(() => setT(left(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  // the slips come out of their pockets the first time the countdown is on screen
  useEffect(() => {
    const el = tiles.current;
    if (!el || typeof IntersectionObserver === "undefined") return setShown(true);
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cells: [number, string][] = [
    [t.days, "Days"],
    [t.hours, "Hours"],
    [t.minutes, "Minutes"],
    [t.seconds, "Seconds"],
  ];

  return (
    <div
      ref={tiles}
      className={`cd2 ${shown ? "is-out" : ""} ${className}`}
      role="timer"
      aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes to go`}
    >
      {cells.map(([v, label], i) => (
        <Slip key={label} value={two(v)} label={label} index={i} />
      ))}
    </div>
  );
}
