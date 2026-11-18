import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useWedding } from "@/context/WeddingContext";
import { formatTimeRange } from "@/lib/format";
import { MapWindow } from "@/components/sections/travel/MapWindow";
import { RouteNotes } from "@/components/sections/travel/RouteNotes";
import { StayTags } from "@/components/sections/travel/StayTags";

/**
 * Venue / Travel & Stay — one parchment card on the sky that simply scrolls
 * (nothing pinned, so nothing can be clipped by the screen edges). Phones:
 * venue card, map and its buttons stacked at full width (16px side padding).
 * Desktop: venue and map side by side inside the card. The map starts
 * loading a screen early, so it is showing when the section arrives.
 */
export function TravelScene() {
  const { venue, wedding, stay = [], travelNotes = [], couple } = useWedding();
  const reduced = usePrefersReducedMotion();
  const tz = wedding.timeZone;
  const d = new Date(wedding.dateISO);
  const dateLabel = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" }).format(d);
  const timeLabel = formatTimeRange(wedding.dateISO, tz);
  const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "2-digit", year: "2-digit" }).format(d).replace(/\//g, "·");
  const city = wedding.city.split(",")[0];
  const initials = `${couple.bride.name[0]} & ${couple.groom.name[0]}`;
  const longDate = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
  const startTime = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(d).toUpperCase();

  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-in]").forEach((el) =>
        gsap.from(el, { autoAlpha: 0, y: 26, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
      );
      gsap.from(".venue-seal", {
        autoAlpha: 0,
        scale: 2.2,
        rotate: -40,
        duration: 0.45,
        ease: "power3.in",
        scrollTrigger: { trigger: ".venue-pass", start: "top 85%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="travelStay" aria-labelledby="travel-heading" className="cobalt relative px-4 py-[max(3rem,8svh)]">
      <div className="parchment frieze-border mx-auto w-full max-w-[64rem] rounded-[6px] px-5 py-7 md:px-10 md:py-10">
        <div data-in className="text-center">
          <p className="text-[0.95rem] tracking-[0.2em] text-maroon">विवाह स्थल</p>
          <h2 id="travel-heading" className="mt-1 text-[0.85rem] font-bold uppercase tracking-[0.34em] text-ink">
            The Venue
          </h2>
          <p className="mt-2 font-script text-[clamp(2.2rem,9vw,3.2rem)] leading-none text-accent">{venue.name}</p>
          <p className="mt-1 text-[0.95rem] text-ink">{wedding.city}</p>
          <p className="mt-1 text-[0.85rem] italic text-ink">
            Muhurtham · {longDate} · {startTime}
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:mt-8 md:grid-cols-2 md:items-start md:gap-10">
          {/* venue details */}
          <div data-in className="venue-pass relative rounded-xl border border-gold/60 bg-[#fbf2dc] p-4 pr-20 shadow-[0_8px_20px_rgb(74_40_20/0.12)] md:p-5 md:pr-24">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink">Venue</p>
            <h3 className="mt-1 text-[1.05rem] font-bold uppercase leading-snug tracking-[0.08em] text-ink">{venue.name}</h3>
            <address className="mt-1.5 text-[0.92rem] not-italic leading-snug text-ink">{venue.address}</address>
            <div aria-hidden className="my-3 border-t border-dashed border-gold/70" />
            <dl className="grid grid-cols-3 gap-2">
              {[
                ["Date", dateLabel],
                ["Muhurtham", timeLabel],
                ["City", city],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[0.56rem] uppercase tracking-[0.2em] text-ink-soft">{k}</dt>
                  <dd className="text-[0.95rem] leading-tight text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div aria-hidden className="venue-seal absolute right-3 top-3 grid h-14 w-14 -rotate-12 place-items-center rounded-full border-2 border-accent/80 bg-[#fbf2dc] text-accent">
              <div className="absolute inset-[3px] rounded-full border border-dashed border-accent/60" />
              <div className="text-center leading-none">
                <span className="block font-script text-[1rem]">{initials}</span>
                <span className="mt-0.5 block text-[0.4rem] tracking-[0.16em]">{shortDate}</span>
              </div>
            </div>
          </div>

          {/* the map, with Open in Google Maps / Copy address under it */}
          <div data-in>
            <MapWindow query={venue.mapsQuery} address={venue.address} venueName={venue.name} />
          </div>
        </div>

        {travelNotes.length > 0 && (
          <div data-in className="mt-8">
            <h3 className="mb-4 text-[0.68rem] uppercase tracking-[0.26em] text-ink">How to reach</h3>
            <RouteNotes notes={travelNotes} />
          </div>
        )}
        {stay.length > 0 && (
          <div data-in className="mt-8">
            <h3 className="mb-3 text-center text-[0.68rem] uppercase tracking-[0.26em] text-ink">Where to stay</h3>
            <StayTags stays={stay} />
          </div>
        )}
      </div>
    </section>
  );
}
