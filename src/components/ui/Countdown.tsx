import { useEffect, useRef, useState } from "react";

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

/**
 * Live "counting the days": four temple-niche boxes (days, hours, minutes,
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
    <div className={`cd-row ${className}`} role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes to go`}>
      {cells.map(([v, label], i) => (
        <div key={label} data-box className="relative">
          {i > 0 && <i aria-hidden className="cd-dot" />}
          <div ref={label === "Seconds" ? secBox : undefined} className="cd-box" aria-hidden>
            <svg viewBox="0 0 48 10" className="cd-crest" preserveAspectRatio="none">
              <path d="M0 10C8 10 10 4 16 4c3 0 4-3 8-3s5 3 8 3c6 0 8 6 16 6" fill="#EFDDB8" stroke="#B8893E" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            <Flip value={two(v)} />
            <span className="cd-label">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
