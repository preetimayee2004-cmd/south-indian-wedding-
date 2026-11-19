import { useEffect, useRef, useState } from "react";
import { Bell } from "@/components/scenes/invite/Ornaments";

function left(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

const two = (n: number) => String(n).padStart(2, "0");

/**
 * A number that flips when it changes: the old one rotates out upward and the
 * new one rotates in from below (rotateX, 0.4 s; CSS cd-out / cd-in).
 */
function Flip({ value }: { value: string }) {
  const [state, setState] = useState({ cur: value, prev: value, n: 0 });
  if (value !== state.cur) setState({ cur: value, prev: state.cur, n: state.n + 1 });
  return (
    <span className="cd-num">
      {state.n > 0 && (
        <span key={`o${state.n}`} className="cd-digit cd-out" aria-hidden>
          {state.prev}
        </span>
      )}
      <span key={`i${state.n}`} className={`cd-digit ${state.n > 0 ? "cd-in" : ""}`}>
        {state.cur}
      </span>
    </span>
  );
}

/** One box hung from the rod by a short chain, with a bell under it; it swings (3°, from the top) when its number changes. */
function Hanging({ value, label, dot, boxRef }: { value: number; label: string; dot: boolean; boxRef?: React.Ref<HTMLDivElement> }) {
  const swing = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) return void (first.current = false);
    swing.current?.animate?.(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(3deg)" }, { transform: "rotate(-1.5deg)" }, { transform: "rotate(0deg)" }],
      { duration: 900, easing: "ease-in-out" },
    );
  }, [value]);
  return (
    <div data-box className="relative">
      {dot && <i aria-hidden className="cd-dot" />}
      <div ref={swing} className="cd-swing">
        <span aria-hidden className="cd-chain" />
        <div ref={boxRef} className="cd-box" aria-hidden>
          <svg viewBox="0 0 48 10" className="cd-crest" preserveAspectRatio="none">
            <path d="M0 10C8 10 10 4 16 4c3 0 4-3 8-3s5 3 8 3c6 0 8 6 16 6" fill="#EFDDB8" stroke="#B8893E" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <Flip value={two(value)} />
          <span className="cd-label">{label}</span>
        </div>
        <Bell />
      </div>
    </div>
  );
}

/**
 * Live "counting the days": four temple-niche boxes hung from a gold rod by chains, a bell under each, (days, hours, minutes,
 * seconds) in one row with a gold dot between each pair. Numbers are always
 * two digits with tabular figures, flip on change, and the seconds box gives
 * a tiny pulse each tick. Each box's outer wrapper is marked data-box so the
 * section can raise them in one after another.
 */
export function Countdown({ iso, className = "" }: { iso: string; className?: string }) {
  const target = new Date(iso).getTime();
  const [t, setT] = useState(() => left(target));
  const secBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setT(left(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  // the seconds box pulses (1 → 1.04 → 1) on every tick
  useEffect(() => {
    secBox.current?.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.04)" }, { transform: "scale(1)" }], { duration: 420, easing: "ease-out" });
  }, [t.seconds]);

  const cells: [number, string][] = [
    [t.days, "Days"],
    [t.hours, "Hours"],
    [t.minutes, "Minutes"],
    [t.seconds, "Seconds"],
  ];
  return (
    <div className={`cd-hang ${className}`}>
      <span aria-hidden className="cd-rod" />
      <div className="cd-row" role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes to go`}>
        {cells.map(([v, label], i) => (
          <Hanging key={label} value={v} label={label} dot={i > 0} boxRef={label === "Seconds" ? secBox : undefined} />
        ))}
      </div>
    </div>
  );
}
