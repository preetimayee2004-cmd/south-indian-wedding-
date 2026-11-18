import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { formatTimeRange } from "@/lib/format";
import { MapWindow } from "@/components/sections/travel/MapWindow";
import { RouteNotes } from "@/components/sections/travel/RouteNotes";
import { StayTags } from "@/components/sections/travel/StayTags";

/**
 * Scene 10 — Travel & Stay, in the same parchment-and-frieze style as the
 * families. Venue details on the left, the map card on the right; then how
 * to reach and where to stay drift up through the frame while it is pinned.
 */
export function TravelScene() {
  const { venue, wedding, stay = [], travelNotes = [], couple } = useWedding();
  const tz = wedding.timeZone;
  const d = new Date(wedding.dateISO);
  const dateLabel = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "short" }).format(d);
  const timeLabel = formatTimeRange(wedding.dateISO, tz);
  const shortDate = new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "2-digit", year: "2-digit" }).format(d).replace(/\//g, "·");
  const city = wedding.city.split(",")[0];
  const initials = `${couple.bride.name[0]} & ${couple.groom.name[0]}`;

  const win = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const more = useRef<HTMLDivElement>(null);

  const build: Build = (tl) => {
    tl.from(head.current!.children, { autoAlpha: 0, y: 16, duration: 0.3, stagger: 0.1, ease: "power2.out" }, 0)
      .fromTo(left.current, { xPercent: -110 }, { xPercent: 0, duration: 0.5, ease: "power2.out" }, 0.2)
      .fromTo(right.current, { xPercent: 110 }, { xPercent: 0, duration: 0.5, ease: "power2.out" }, 0.35)
      .from(".venue-seal", { autoAlpha: 0, scale: 2.2, rotate: -40, duration: 0.25, ease: "power3.in" }, 0.7);
    if (more.current) tl.from(more.current.children, { autoAlpha: 0, y: 24, duration: 0.3, stagger: 0.15 }, 0.9);
    // the rest of the page drifts up through the frame
    const over = () => Math.max(0, track.current!.offsetHeight - win.current!.clientHeight);
    const screens = over() / window.innerHeight;
    tl.to(track.current, { y: () => -over(), duration: Math.max(0.6, screens * 1.1) }, 0.9).to({}, { duration: 0.25 });
  };

  return (
    <Scene
      id="travelStay"
      labelledBy="travel-heading"
      className="bg-[#7a2e2a]"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-frieze-top" />}
    >
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.03) 0 6px, transparent 6px 14px), linear-gradient(#7a2e2a, #5e211e)" }} />
      <div className="relative flex h-full px-[14px] py-[max(1.25rem,3svh)]">
        <div ref={win} className="parchment frieze-border relative w-full overflow-hidden rounded-[6px]">
          <div ref={track} data-layer className="px-3.5 pb-8 pt-5">
            <div ref={head} className="text-center">
              <p className="text-eyebrow uppercase text-ink">Getting there</p>
              <h2 id="travel-heading" className="script-heading mt-1 text-[clamp(2.4rem,10vw,3.6rem)] leading-none">
                Travel &amp; Stay
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-2 items-start gap-3">
              {/* venue details */}
              <div ref={left} data-layer className="venue-pass relative rounded-xl border border-gold/60 bg-[#fbf2dc] p-3 shadow-[0_8px_20px_rgb(74_40_20/0.12)]">
                <p className="text-[0.58rem] uppercase tracking-[0.24em] text-ink">Venue</p>
                <h3 className="mt-1 text-[0.98rem] font-bold uppercase leading-snug tracking-[0.08em] text-ink">{venue.name}</h3>
                <address className="mt-1.5 text-[0.86rem] not-italic leading-snug text-ink">{venue.address}</address>
                <div aria-hidden className="my-3 border-t border-dashed border-gold/70" />
                <dl className="space-y-2">
                  {[
                    ["Date", dateLabel],
                    ["Muhurtham", timeLabel],
                    ["City", city],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[0.56rem] uppercase tracking-[0.22em] text-ink-soft">{k}</dt>
                      <dd className="text-[0.95rem] leading-tight text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div aria-hidden className="venue-seal absolute -right-1 -top-3 grid h-14 w-14 -rotate-12 place-items-center rounded-full border-2 border-accent/80 bg-[#fbf2dc] text-accent">
                  <div className="absolute inset-[3px] rounded-full border border-dashed border-accent/60" />
                  <div className="text-center leading-none">
                    <span className="block font-script text-[1rem]">{initials}</span>
                    <span className="mt-0.5 block text-[0.4rem] tracking-[0.16em]">{shortDate}</span>
                  </div>
                </div>
              </div>
              {/* map card */}
              <div ref={right} data-layer>
                <MapWindow query={venue.mapsQuery} address={venue.address} venueName={venue.name} compact />
              </div>
            </div>

            <div ref={more}>
              {travelNotes.length > 0 && (
                <div className="mt-7">
                  <h3 className="mb-4 text-[0.68rem] uppercase tracking-[0.26em] text-ink">How to reach</h3>
                  <RouteNotes notes={travelNotes} />
                </div>
              )}
              {stay.length > 0 && (
                <div className="mt-7">
                  <h3 className="mb-3 text-center text-[0.68rem] uppercase tracking-[0.26em] text-ink">Where to stay</h3>
                  <StayTags stays={stay} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
