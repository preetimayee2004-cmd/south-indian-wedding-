import { useEffect, useState } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** ms remaining; ≤ 0 once the moment has arrived. */
  remaining: number;
}

function parts(target: number): CountdownParts {
  const remaining = target - Date.now();
  const s = Math.max(0, Math.floor(remaining / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    remaining,
  };
}

/** Live countdown, ticking on the second boundary. Stops once the target passes. */
export function useCountdown(targetISO: string): CountdownParts {
  const target = new Date(targetISO).getTime();
  const [state, setState] = useState(() => parts(target));

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const next = parts(target);
      setState(next);
      if (next.remaining > 0) timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [target]);

  return state;
}
