import type { StayOption } from "@/config/types";

/**
 * Places to stay as luggage tags. Swipe sideways on phones; wrap on desktop.
 * `.stay-tag` swings in from its hole (animated by the section).
 */
export function StayTags({ stays }: { stays: StayOption[] }) {
  return (
    <div className="-mx-gutter overflow-x-auto px-gutter pb-4 pt-2 [scrollbar-width:thin] md:mx-0 md:px-0">
      <ul className="flex w-max snap-x snap-mandatory gap-5 md:w-auto md:flex-wrap md:justify-center">
        {stays.map((s) => (
          <li key={s.name} className="snap-start">
            <article
              className="stay-tag relative w-[15.5rem] origin-[0.9rem_50%] border border-gold/50 bg-paper py-5 pl-11 pr-5 shadow-[0_8px_22px_rgb(42_36_33/0.07)]"
              style={{
                clipPath: "polygon(1.6rem 0, 100% 0, 100% 100%, 1.6rem 100%, 0 calc(100% - 1.6rem), 0 1.6rem)",
                borderRadius: "0 14px 14px 0",
              }}
            >
              <span aria-hidden className="absolute left-[0.6rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-gold bg-ivory" />
              <h4 className="text-[1.02rem] font-medium leading-snug text-ink">{s.name}</h4>
              {s.distance && <p className="mt-1 text-[0.66rem] uppercase tracking-[0.22em] text-accent">{s.distance}</p>}
              {s.note && <p className="mt-2 text-[0.92rem] leading-snug text-ink-soft">{s.note}</p>}
              {s.url && (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[0.7rem] uppercase tracking-[0.2em] text-ink underline decoration-gold/60 underline-offset-4 hover:text-accent"
                >
                  View ↗
                </a>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
