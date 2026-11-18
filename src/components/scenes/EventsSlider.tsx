import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Ornament } from "@/components/ui/Ornament";
import { EventPanel } from "@/components/sections/events/EventPanel";

const GAP = 5000; // each event stays 5 s while the section is on screen

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={`h-5 w-5 ${flip ? "rotate-180" : ""}`}>
    <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The celebrations, on the cobalt sky after the couple (as in the reference
 * invitation): one framed card at a time that slides sideways to the next.
 * The events move on by themselves every 5 s while the section is on screen,
 * until the guest touches anything in it (arrow, dot, swipe, key) — from then
 * on only the guest changes the event. Arrows on the card's sides, dots and a
 * "1 / 3" counter below; swipe or drag works too.
 */
export function EventsSlider() {
  const { events, wedding } = useWedding();
  const reduced = usePrefersReducedMotion();
  const n = events.length;
  const [cur, setCur] = useState(0);
  const root = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const stopped = useRef(false);
  const visible = useRef(false);
  const timer = useRef(0);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const show = useCallback((i: number) => setCur(((i % n) + n) % n), [n]);
  const stop = useCallback(() => {
    stopped.current = true;
    window.clearTimeout(timer.current);
  }, []);

  // auto-advance while on screen, until the guest takes over
  const arm = useCallback(() => {
    window.clearTimeout(timer.current);
    if (stopped.current || !visible.current || reduced || n < 2) return;
    timer.current = window.setTimeout(() => {
      if (stopped.current || !visible.current) return;
      if (!document.hidden) setCur((c) => (c + 1) % n);
      arm();
    }, GAP);
  }, [n, reduced]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting !== visible.current) {
          visible.current = e.isIntersecting;
          arm();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer.current);
    };
  }, [arm]);

  // the heading and card fade up as the section arrives
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from([...head.current!.children, card.current], {
        opacity: 0,
        y: 24,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  if (!n) return null;

  const byGuest = (i: number) => {
    stop();
    show(i);
  };
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) byGuest(cur + (dx < 0 ? 1 : -1));
  };
  const arrowBtn =
    "absolute top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[#d9b25f] bg-[#fbf2dc] text-maroon shadow-[0_6px_16px_rgb(5_15_45/0.35)] transition-transform active:scale-90";

  return (
    <section
      ref={root}
      id="events"
      aria-labelledby="events-heading"
      className="cobalt relative flex min-h-[100svh] flex-col items-center justify-center px-gutter py-14"
      onPointerDown={stop}
      onKeyDown={stop}
    >
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#004DB7" }} />
      {/* as in the reference: no heading on screen, just the framed event (named for screen readers) */}
      <div ref={head} className="flex justify-center">
        <h2 id="events-heading" className="sr-only">
          The wedding celebrations
        </h2>
        <Ornament className="text-[#f3cf73]" />
      </div>

      <div ref={card} className="relative mt-5 w-full max-w-[27rem]">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Wedding events"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") (e.preventDefault(), byGuest(cur + 1));
            else if (e.key === "ArrowLeft") (e.preventDefault(), byGuest(cur - 1));
          }}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
          className="parchment frieze-border touch-pan-y select-none overflow-hidden rounded-[6px] outline-none"
        >
          <div className="flex transition-transform duration-[650ms] ease-silk will-change-transform" style={{ transform: `translateX(${-cur * 100}%)` }}>
            {events.map((e, i) => (
              <div
                key={e.id}
                className="w-full shrink-0 px-6 pb-7 pt-7"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${n}: ${e.name}`}
                aria-hidden={i !== cur}
                inert={i !== cur}
              >
                <EventPanel event={e} index={i} total={n} timeZone={wedding.timeZone} variant="flow" />
              </div>
            ))}
          </div>
        </div>
        {n > 1 && (
          <>
            <button type="button" aria-label="Previous event" onClick={() => byGuest(cur - 1)} className={`${arrowBtn} -left-3`}>
              <Chevron flip />
            </button>
            <button type="button" aria-label="Next event" onClick={() => byGuest(cur + 1)} className={`${arrowBtn} -right-3`}>
              <Chevron />
            </button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-6 flex items-center gap-3" role="tablist" aria-label="Choose an event">
          {events.map((e, i) => (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={i === cur}
              aria-label={`Show ${e.name}`}
              onClick={() => byGuest(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === cur ? "w-6 bg-[#f3cf73]" : "w-2.5 bg-[#fbf2dc]/45"}`}
            />
          ))}
          <span aria-live="polite" className="ml-1 text-[0.72rem] tabular-nums tracking-[0.2em] text-[#fbf2dc]">
            {cur + 1} / {n}
          </span>
        </div>
      )}
    </section>
  );
}
