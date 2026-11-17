import type { Venue } from "@/config/types";

interface Props {
  venue: Venue;
  dateLabel: string;
  timeLabel: string;
  city: string;
  initials: string;
  shortDate: string;
}

/**
 * The venue as a keepsake pass: name and address above a perforated tear
 * line, date / muhurtham / city on the stub, and an ink seal that stamps on.
 */
export function VenuePass({ venue, dateLabel, timeLabel, city, initials, shortDate }: Props) {
  return (
    <article className="venue-pass relative overflow-hidden rounded-2xl border border-gold/50 bg-paper shadow-[0_10px_30px_rgb(42_36_33/0.07)]">
      {venue.image && <img src={venue.image} alt={venue.name} loading="lazy" className="h-40 w-full object-cover" />}
      <div className="px-6 pb-6 pr-24 pt-6">
        <p className="text-[0.66rem] uppercase tracking-[0.28em] text-ink-soft">Venue</p>
        <h3 className="mt-2 text-[1.3rem] font-medium uppercase leading-snug tracking-[0.12em] text-ink">{venue.name}</h3>
        <address className="mt-2 not-italic leading-snug text-ink-soft">{venue.address}</address>
      </div>

      {/* tear line with side notches */}
      <div className="relative">
        <span aria-hidden className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-gold/50 bg-ivory" />
        <span aria-hidden className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-gold/50 bg-ivory" />
        <div className="mx-5 border-t border-dashed border-gold/60" />
      </div>

      <dl className="grid grid-cols-3 divide-x divide-line px-2 py-5 text-center">
        {[
          ["Date", dateLabel],
          ["Muhurtham", timeLabel],
          ["City", city],
        ].map(([k, v]) => (
          <div key={k} className="px-2">
            <dt className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-soft">{k}</dt>
            <dd className="mt-1 text-[1.02rem] leading-tight text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {/* ink seal */}
      <div
        aria-hidden
        className="venue-seal absolute right-4 top-5 grid h-[4.75rem] w-[4.75rem] -rotate-12 place-items-center rounded-full border-2 border-accent/70 text-accent/80 mix-blend-multiply"
      >
        <div className="absolute inset-[4px] rounded-full border border-dashed border-accent/50" />
        <div className="text-center leading-none">
          <span className="block font-script text-[1.45rem]">{initials}</span>
          <span className="mt-1 block text-[0.5rem] tracking-[0.2em]">{shortDate}</span>
        </div>
      </div>
    </article>
  );
}
