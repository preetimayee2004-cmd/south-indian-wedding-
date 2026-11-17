import type { SavedRsvp } from "@/lib/rsvp";

const DOTS = 24;

/**
 * Confirmation: a ring of kolam dots draws itself around a diya (accepted) or
 * a lotus (declined), then the personal reply appears.
 */
export function RsvpConfirmation({ saved, onChange }: { saved: SavedRsvp; onChange: () => void }) {
  const first = saved.name.split(" ")[0];
  return (
    <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
      <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden>
        {Array.from({ length: DOTS }, (_, i) => {
          const a = (i / DOTS) * Math.PI * 2 - Math.PI / 2;
          return (
            <circle
              key={i}
              cx={60 + Math.cos(a) * 50}
              cy={60 + Math.sin(a) * 50}
              r={i % 3 === 0 ? 2.6 : 1.7}
              className="fill-gold motion-safe:animate-[dotIn_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 0.04}s` }}
            />
          );
        })}
        <g className="motion-safe:animate-[dotIn_0.6s_ease-out_1s_both]" stroke="rgb(var(--c-accent))" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {saved.attending ? (
            <>
              <path d="M60 38c4 5 5.5 8.5 5.5 11a5.5 5.5 0 0 1-11 0c0-2.5 1.5-6 5.5-11Z" fill="rgb(var(--c-accent) / 0.15)" />
              <path d="M40 64h40c-2 8-10 13-20 13s-18-5-20-13Z" />
              <path d="M48 77l-3 6h30l-3-6" />
            </>
          ) : (
            <>
              <path d="M60 44c6 6 9 11 9 16s-4 10-9 13c-5-3-9-8-9-13s3-10 9-16Z" />
              <path d="M51 66c-6 0-11-3-13-7 6-1 11 1 13 4M69 66c6 0 11-3 13-7-6-1-11 1-13 4" />
              <path d="M44 78h32" />
            </>
          )}
        </g>
      </svg>

      <p className="script-heading mt-3 text-[2rem] leading-tight motion-safe:animate-[dotIn_0.6s_ease-out_1.2s_both]">
        {saved.attending ? `Wonderful, ${first}!` : `We'll miss you, ${first}`}
      </p>
      <p className="mt-2 max-w-[17rem] leading-snug text-ink-soft motion-safe:animate-[dotIn_0.6s_ease-out_1.35s_both]">
        {saved.attending
          ? `We can't wait to celebrate with you. ${saved.guests === 1 ? "Your seat is" : `${saved.guests} seats are`} saved.`
          : "Thank you for letting us know — your blessings mean the world to us."}
      </p>
      <button
        type="button"
        onClick={onChange}
        className="mt-5 text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft underline decoration-gold/60 underline-offset-4 hover:text-accent"
      >
        Change response
      </button>
    </div>
  );
}
