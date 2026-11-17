import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { formatDay, formatTimeRange, directionsUrl } from "@/lib/format";
import { EventIcon } from "@/components/sections/events/EventIcon";
import { desktopArt } from "../art";

const OVERLAP = "18vh";

/**
 * Desktop scene 5 — the celebrations. The temple border stays put behind
 * (sticky) while each ceremony arrives as one large framed card, like turning
 * through a printed invitation: picture on the left, details on the right.
 */
export function EventsScene() {
  const config = useWedding();
  const { events, wedding } = config;
  const art = desktopArt(config, "events");
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const box = el.querySelector<HTMLElement>(".ev-bg")!;
      const travel = () => Math.max(0, img.current!.offsetHeight - box.offsetHeight);
      gsap.set(img.current, { y: () => -travel() * (art.focus ?? 0.5) });
      if (reduced) return;
      gsap.utils.toArray<HTMLElement>(".ev-card, .ev-intro").forEach((card) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 60,
          scale: 0.97,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 78%", once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, art.focus]);

  if (!events.length) return null;

  return (
    <section
      ref={root}
      id="events"
      aria-labelledby="events-heading"
      className="relative isolate"
      style={{
        marginTop: `-${OVERLAP}`,
        maskImage: `linear-gradient(to bottom, transparent 0, #000 ${OVERLAP})`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0, #000 ${OVERLAP})`,
      }}
    >
      {/* Temple border that stays behind every card */}
      <div aria-hidden className="ev-bg sticky top-0 -z-10 -mb-[100svh] h-[100svh] overflow-hidden bg-ivory">
        <img
          ref={img}
          src={art.src}
          alt=""
          loading="lazy"
          className="absolute left-0 top-0 w-full object-cover"
          style={{ aspectRatio: String(art.ratio), minHeight: "100%" }}
          draggable={false}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 48% 55% at 50% 50%, rgb(var(--c-ivory) / 0.7), transparent 80%)" }} />
      </div>

      <div className="ev-intro flex min-h-[100svh] flex-col items-center justify-center px-[6vw] text-center">
        <p className="eyebrow">You are invited to</p>
        <h2 id="events-heading" className="script-heading mt-2 text-[clamp(3.4rem,5vw,5rem)] leading-none">
          the following celebrations
        </h2>
        <p className="mt-6 text-[0.8rem] uppercase tracking-[0.3em] text-ink-soft">
          {events.length} ceremonies · scroll to turn the page
        </p>
      </div>

      {events.map((e, i) => {
        const tone = e.tone ?? "rgb(var(--c-accent))";
        return (
          <div key={e.id} className="flex min-h-[100svh] items-center justify-center px-[6vw] py-[10vh]">
            <article className="ev-card w-full max-w-[64rem] rounded-[30px] border border-gold/50 bg-paper/95 p-[6px] shadow-[0_40px_90px_-35px_rgb(42_36_33/0.5)]">
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-12 rounded-[24px] border border-gold/30 p-[clamp(1.5rem,3vw,2.75rem)]">
                {/* picture */}
                <div className="overflow-hidden rounded-t-[999px] rounded-b-[18px] border border-gold/50 p-[5px]">
                  {e.image ? (
                    <img src={e.image} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-[14px] object-cover" />
                  ) : (
                    <div
                      className="grid aspect-[4/5] w-full place-items-center rounded-t-[999px] rounded-b-[14px]"
                      style={{ background: `radial-gradient(circle at 50% 42%, #fffaf0, #f2e6cf 70%)`, color: tone }}
                    >
                      <EventIcon name={e.icon ?? "diya"} className="h-[38%] w-[38%]" />
                    </div>
                  )}
                </div>

                {/* details */}
                <div>
                  <p className="text-[0.75rem] tabular-nums tracking-[0.32em] text-ink-soft">
                    {String(i + 1).padStart(2, "0")} <span className="opacity-50">/ {String(events.length).padStart(2, "0")}</span>
                  </p>
                  <h3 className="mt-2 font-script text-[clamp(3.2rem,4.6vw,4.6rem)] font-normal leading-none" style={{ color: tone }}>
                    {e.name}
                  </h3>
                  <p className="mt-5 text-[0.82rem] uppercase tracking-[0.24em] text-ink-soft">{formatDay(e.startISO, wedding.timeZone)}</p>
                  <p className="mt-1 text-[1.7rem] text-ink">{formatTimeRange(e.startISO, wedding.timeZone, e.endISO)}</p>

                  <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-gold/40 pt-6">
                    {e.venue && (
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.24em] text-ink-soft">Venue</dt>
                        <dd className="mt-1 leading-snug text-ink">{e.venue}</dd>
                      </div>
                    )}
                    {e.dressCode && (
                      <div>
                        <dt className="text-[0.66rem] uppercase tracking-[0.24em] text-ink-soft">Dress code</dt>
                        <dd className="mt-1 flex items-center gap-2 leading-snug text-ink">
                          {e.dressColors?.slice(0, 3).map((c) => (
                            <span key={c} aria-hidden className="inline-block h-3 w-3 rounded-full ring-1 ring-ink/10" style={{ background: c }} />
                          ))}
                          {e.dressCode}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {e.description && <p className="mt-5 text-[1.1rem] italic leading-snug text-ink-soft">{e.description}</p>}
                  {e.mapsQuery && (
                    <a
                      href={directionsUrl(e.mapsQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-block rounded-full px-6 py-3 text-[0.72rem] uppercase tracking-[0.22em] text-paper transition-transform active:scale-95"
                      style={{ background: tone }}
                    >
                      See route ↗
                    </a>
                  )}
                </div>
              </div>
            </article>
          </div>
        );
      })}
    </section>
  );
}
