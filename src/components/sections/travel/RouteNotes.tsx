const ICONS = {
  plane: "M3 13l7-2 4-7h2l-2 7 6 2v2l-6-1-2 5h-2l1-5-7-1Z",
  train: "M7 3h10a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Zm-2 7h14M9 21l2-4m4 4-2-4M9 14h.01M15 14h.01",
  bus: "M6 3h12a2 2 0 0 1 2 2v11H4V5a2 2 0 0 1 2-2ZM4 11h16M7 19v-3m10 3v-3M8 14h.01M16 14h.01",
  car: "M5 16V12l2-5h10l2 5v4H5Zm0 0v2m14-2v2M5 12h14M8 14h.01M16 14h.01",
} as const;

function iconFor(text: string): keyof typeof ICONS {
  if (/airport|flight|fly/i.test(text)) return "plane";
  if (/railway|station|train/i.test(text)) return "train";
  if (/\bbus\b/i.test(text)) return "bus";
  return "car";
}

/** How to reach: one row per note, with an icon chosen from its words. */
export function RouteNotes({ notes }: { notes: string[] }) {
  return (
    <ul className="space-y-4">
      {notes.map((n) => (
        <li key={n} className="route-note flex items-start gap-4">
          <span className="route-icon grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/60 text-accent">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={ICONS[iconFor(n)]} />
            </svg>
          </span>
          <p className="pt-2 leading-snug text-ink">{n}</p>
        </li>
      ))}
    </ul>
  );
}
