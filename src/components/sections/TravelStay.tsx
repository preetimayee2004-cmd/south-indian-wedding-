import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { formatTimeRange } from "@/lib/format";
import { VenuePass } from "./travel/VenuePass";
import { MapWindow } from "./travel/MapWindow";
import { RouteNotes } from "./travel/RouteNotes";
import { StayTags } from "./travel/StayTags";

/**
 * Section 08 — Travel & Stay.
 * A venue pass gets an ink seal stamped on it; the map unfolds in an arch
 * window with Directions / Copy address; travel notes and luggage-tag stays
 * swing in from their holes. Two columns from desktop up.
 */
export function TravelStay() {
  const { venue, wedding, stay = [], travelNotes = [], couple } = useWedding();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);

  const tz = wedding.timeZone;
  const d = new Date(wedding.dateISO);
  const dateLabel = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" }).format(d);
  const timeLabel = formatTimeRange(wedding.dateISO, tz);
  const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "2-digit", year: "2-digit" }).format(d).replace(/\//g, "·");
  const city = wedding.city.split(",")[0];
  const initials = `${couple.bride.name[0]} & ${couple.groom.name[0]}`;

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const st = (trigger: string, start = "top 82%") => ({ trigger, start, once: true });

      gsap.from(".travel-head > *", { autoAlpha: 0, y: 14, duration: 0.8, stagger: 0.12, ease: "power2.out", scrollTrigger: st(".travel-head") });

      gsap
        .timeline({ scrollTrigger: st(".venue-pass") })
        .from(".venue-pass", { autoAlpha: 0, y: 30, duration: 0.8, ease: "power2.out" })
        // the seal thumps down, overshoots and settles
        .from(".venue-seal", { autoAlpha: 0, scale: 2.4, rotate: -40, duration: 0.45, ease: "power4.in" }, "-=0.1")
        .to(".venue-pass", { y: 3, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" });

      gsap.from(".map-window", {
        autoAlpha: 0,
        scaleY: 0.86,
        transformOrigin: "50% 0%",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: st(".map-window"),
      });
      gsap.from(".route-icon", { scale: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2.2)", scrollTrigger: st(".route-note") });
      gsap.from(".route-note p", { autoAlpha: 0, x: -10, duration: 0.6, stagger: 0.12, ease: "power2.out", scrollTrigger: st(".route-note") });
      gsap.from(".stay-tag", {
        rotate: -14,
        autoAlpha: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: "elastic.out(1, 0.45)",
        scrollTrigger: st(".stay-tag", "top 88%"),
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="travelStay" aria-labelledby="travel-heading" className="relative isolate py-section">
      <Container>
        <div className="travel-head text-center">
          <p className="eyebrow">Getting there</p>
          <h2 id="travel-heading" className="script-heading mt-2 text-script-lg">
            Travel &amp; Stay
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-[30rem] gap-10 xl:max-w-none xl:grid-cols-2 xl:items-start xl:gap-14">
          <div className="space-y-10">
            <VenuePass venue={venue} dateLabel={dateLabel} timeLabel={timeLabel} city={city} initials={initials} shortDate={shortDate} />
            {travelNotes.length > 0 && (
              <div>
                <h3 className="mb-5 text-[0.7rem] uppercase tracking-[0.28em] text-ink-soft">How to reach</h3>
                <RouteNotes notes={travelNotes} />
              </div>
            )}
          </div>
          <MapWindow query={venue.mapsQuery} address={venue.address} venueName={venue.name} />
        </div>

        {stay.length > 0 && (
          <div className="mt-14">
            <h3 className="mb-4 text-center text-[0.7rem] uppercase tracking-[0.28em] text-ink-soft">Where to stay</h3>
            <StayTags stays={stay} />
          </div>
        )}
      </Container>
    </section>
  );
}
