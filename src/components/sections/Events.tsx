import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { Ornament } from "@/components/ui/Ornament";
import { formatDay, formatTimeRange, mapsUrl } from "@/lib/format";
import { EventPanel } from "./events/EventPanel";

const IMG_RATIO = "768 / 1376";

/**
 * Section 03 — Order of the Day.
 * The pillared hall stays pinned while the page scrolls; each ceremony unrolls
 * top-to-bottom between the pillars like a palm-leaf manuscript, replacing the
 * last. Small diyas along the bottom light up to show progress. Scroll snaps
 * to each ceremony so none is left half-revealed.
 * Reduced motion (or a single event): a plain stacked list, no pinning.
 * Screen readers always get a complete list (the animated stage is aria-hidden).
 */
export function Events() {
  const { events, media, wedding } = useWedding();
  const reduced = usePrefersReducedMotion();
  const frame = media.eventsFrame;
  const n = events.length;
  const animated = !reduced && n > 1;

  const wrap = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLImageElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!animated) return;
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(panelsRef.current!.children);
      const dots = gsap.utils.toArray<HTMLElement>(dotsRef.current!.children);
      gsap.set(panels.slice(1), { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" });

      let current = -1;
      const light = (idx: number) => {
        if (idx === current) return;
        current = idx;
        dots.forEach((d, i) => d.classList.toggle("is-lit", i <= idx));
      };
      light(0);

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: wrap.current,
          pin: true,
          start: "top top",
          end: `+=${(n - 1) * 85}%`,
          scrub: 0.5,
          anticipatePin: 1,
          snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
          onUpdate: (self) => light(Math.round(self.progress * (n - 1))),
        },
      });

      tl.addLabel("e0");
      for (let i = 1; i < n; i++) {
        const prev = panels[i - 1];
        const next = panels[i];
        tl.to(prev, { autoAlpha: 0, y: -18, duration: 0.45, ease: "power1.in" })
          .set(next, { autoAlpha: 1 }, "<0.2")
          .fromTo(next, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9 }, "<")
          .fromTo(next.querySelector(".ev-mark"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, "<0.35")
          .addLabel(`e${i}`)
          .to({}, { duration: 0.25 }); // breathing room so each ceremony rests
      }
      // The hall drifts very slightly closer through the whole sequence.
      tl.fromTo(art.current, { scale: 1.06 }, { scale: 1, ease: "none", duration: tl.duration() }, 0);
    });
    return () => ctx.revert();
  }, [animated, n]);

  if (n === 0) return null;

  const heading = (stage: boolean) => (
    <div className="text-center">
      <p className="uppercase text-ink-soft" style={{ fontSize: stage ? "1.2cqh" : "0.75rem", letterSpacing: "0.3em" }}>
        The celebrations
      </p>
      <h2 id="events-heading" className="script-heading leading-none" style={{ fontSize: stage ? "4.6cqh" : undefined, marginTop: stage ? "0.6cqh" : "0.5rem" }}>
        <span className={stage ? "" : "text-script-lg"}>Order of the Day</span>
      </h2>
    </div>
  );

  return (
    <section id="events" aria-labelledby="events-heading" className="relative isolate">
      {/* Complete, static list for assistive tech (the animated stage is aria-hidden) */}
      {animated && (
      <ul className="sr-only">
        {events.map((e) => (
          <li key={e.id}>
            {e.name}: {formatDay(e.startISO, wedding.timeZone)}, {formatTimeRange(e.startISO, wedding.timeZone, e.endISO)}.
            {e.venue && ` Venue: ${e.venue}.`}
            {e.dressCode && ` Dress code: ${e.dressCode}.`}
            {e.description && ` ${e.description}`}
            {e.mapsQuery && (
              <a href={mapsUrl(e.mapsQuery)} target="_blank" rel="noopener noreferrer">
                Directions to {e.venue ?? e.name}
              </a>
            )}
          </li>
        ))}
      </ul>
      )}

      {animated ? (
        <div ref={wrap} className="relative overflow-hidden bg-ivory" style={{ height: "100svh" }}>
          <div className="absolute left-1/2 top-0 h-full -translate-x-1/2" style={{ aspectRatio: IMG_RATIO, containerType: "size" }}>
            <img
              ref={art}
              src={media.events}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            <div
              className="absolute flex flex-col"
              style={{ top: `${frame.top}%`, left: `${frame.left}%`, width: `${frame.width}%`, height: `${frame.height}%` }}
            >
              {heading(true)}
              <div ref={panelsRef} aria-hidden className="relative flex-1" style={{ marginTop: "3cqh" }}>
                {events.map((e, i) => (
                  <div key={e.id} className="absolute inset-0">
                    <EventPanel event={e} index={i} total={n} timeZone={wedding.timeZone} variant="stage" />
                  </div>
                ))}
              </div>
              <div ref={dotsRef} aria-hidden className="flex justify-center" style={{ gap: "1.6cqh", paddingBottom: "0.5cqh" }}>
                {events.map((e) => (
                  <svg
                    key={e.id}
                    viewBox="0 0 12 18"
                    className="ev-dot transition-[color,transform] duration-500 [&.is-lit]:scale-110"
                    style={{ height: "1.9cqh", color: e.tone ?? "rgb(var(--c-accent))" }}
                  >
                    <path d="M6 1C9 5 10 7.5 10 10a4 4 0 0 1-8 0c0-2.5 1-5 4-9Z" className="fill-line transition-[fill] duration-500 [.is-lit_&]:fill-current" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-section">
          <Container>
            {heading(false)}
            <div className="mt-12 flex flex-col items-center gap-10">
              {events.map((e, i) => (
                <div key={e.id} className="flex w-full flex-col items-center gap-10">
                  {i > 0 && <Ornament className="text-gold" />}
                  <EventPanel event={e} index={i} total={n} timeZone={wedding.timeZone} variant="flow" />
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}
    </section>
  );
}
