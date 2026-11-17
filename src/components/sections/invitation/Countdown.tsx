import { useCountdown } from "@/hooks/useCountdown";

const UNITS = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
] as const;

/**
 * Live countdown inside a mandapam-arch frame. Each number rolls up when it
 * changes (keyed span + CSS keyframe, so no JS animation per tick).
 */
export function Countdown({ targetISO, label }: { targetISO: string; label: string }) {
  const c = useCountdown(targetISO);
  const arrived = c.remaining <= 0;
  const withinDay = c.remaining > -24 * 3600 * 1000;

  return (
    <div className="relative mx-auto w-full max-w-[22rem] md:max-w-[26rem]">
      {/* Arch frame: outer gold hairline, inner offset hairline */}
      <div className="rounded-t-[999px] border border-gold/50 p-[6px]">
        <div className="rounded-t-[999px] border border-gold/30 bg-paper/70 px-5 pb-8 pt-14 text-center">
          <p className="eyebrow">{arrived ? (withinDay ? "Today is the day" : "Married") : label}</p>

          {arrived ? (
            <p className="script-heading mt-4 text-script-md">
              {withinDay ? "The celebration has begun" : "Thank you for celebrating with us"}
            </p>
          ) : (
            <div
              role="timer"
              aria-live="off"
              aria-label={`${c.days} days, ${c.hours} hours and ${c.minutes} minutes to go`}
              className="mt-6 grid grid-cols-4"
            >
              {UNITS.map(([key, unit], i) => (
                <div key={key} className={`flex flex-col items-center ${i > 0 ? "border-l border-line" : ""}`}>
                  <span className="relative block h-[2.6rem] overflow-hidden text-[2.25rem] leading-[2.6rem] text-ink tabular-nums xs:text-[2.5rem] md:h-[3rem] md:text-[2.9rem] md:leading-[3rem]">
                    <span key={c[key]} className="block animate-[tick_0.55s_cubic-bezier(0.22,1,0.36,1)]" aria-hidden>
                      {String(c[key]).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="mt-1 text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft" aria-hidden>
                    {unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
