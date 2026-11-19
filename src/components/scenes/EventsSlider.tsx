import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { mapsUrl } from "@/lib/format";
import type { EventTheme, WeddingEvent } from "@/config/types";
import { DoorBase, DoorTop, Pillar, ThemeDecor } from "./events/TempleDoorway";

const GAP = 6000; // each event stays 6 s while the section is on screen, until the guest takes over

/** Each event's accent colour (title, marker) and its quieter second colour. */
const THEMES: Record<EventTheme, { accent: string; soft: string }> = {
  nalangu: { accent: "#b57d0c", soft: "#4e7a3c" },
  mehendi: { accent: "#2f6b3a", soft: "#b58c3c" },
  sangeet: { accent: "#7a1f2b", soft: "#b8893e" },
  muhurtham: { accent: "#9e1f28", soft: "#b8893e" },
  reception: { accent: "#6d1a2c", soft: "#b89a5e" },
};

const two = (n: number) => String(n).padStart(2, "0");

function when(e: WeddingEvent, timeZone: string) {
  const d = new Date(e.startISO);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone, weekday: "long", day: "numeric", month: "long" }).formatToParts(d);
  const part = (t: string) => day.find((p) => p.type === t)?.value ?? "";
  const t = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  return {
    date: `${part("weekday")}, ${part("day")} ${part("month")}`,
    time: e.endISO ? `${t(e.startISO)} – ${t(e.endISO)}` : `${t(e.startISO)} onwards`,
  };
}

/** One event's words inside the doorway. */
function EventText({ e, i, n, timeZone }: { e: WeddingEvent; i: number; n: number; timeZone: string }) {
  const w = when(e, timeZone);
  return (
    <div className="ev-text">
      <p className="ev-count">
        {two(i + 1)} / {two(n)}
      </p>
      <h3 className="ev-name">{e.name}</h3>
      {e.subtitle && <p className="ev-sub">{e.subtitle}</p>}
      <p className="ev-date">{w.date}</p>
      <p className="ev-time">{w.time}</p>
      <span aria-hidden className="ev-rule">
        <i />
        <svg viewBox="-10 -8 20 12">
          <path d="M0-7C2.6-4.4 2.6-1.6 0 1-2.6-1.6-2.6-4.4 0-7ZM-1 1C-5 .6-7-1.6-7.6-4.6-4.6-4-2-2.4-1 1ZM1 1C5 .6 7-1.6 7.6-4.6 4.6-4 2-2.4 1 1Z" />
        </svg>
        <i />
      </span>
      {e.venue && (
        <div className="ev-plaque">
          <span className="ev-label">Venue</span>
          <span className="ev-venue">{e.venue}</span>
          {e.mapsQuery && (
            <a href={mapsUrl(e.mapsQuery)} target="_blank" rel="noopener noreferrer" className="ev-map">
              Directions
            </a>
          )}
        </div>
      )}
      {e.dressCode && (
        <div className="ev-dress">
          <span className="ev-label">Dress code</span>
          <span className="ev-dress-line">
            {e.dressColors?.slice(0, 3).map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
            {e.dressCode}
          </span>
        </div>
      )}
      {e.description && <p className="ev-desc">{e.description}</p>}
    </div>
  );
}

/**
 * The celebrations, on the blue sky: one temple doorway in antique gold —
 * a small gopuram crest, a cusped arch, carved pillars and a stepped pedestal —
 * holding one event at a time. The doorway never changes; each event's words
 * glide in sideways like turning the page of an invitation, while its own
 * ornaments (turmeric bowls and banana leaves for Nalangu, henna vines for
 * Mehendi, a festoon for Sangeet, brass lamps and jasmine for the Muhurtham,
 * flowers for the Reception) fade in around the doorway. The events are listed
 * on a slim rail in the sky to the right (beneath the doorway on phones); swipe,
 * the arrow keys or the list change the event, and they move on by themselves
 * every few seconds until the guest takes over.
 */
export function EventsSlider() {
  const { events, wedding } = useWedding();
  const reduced = usePrefersReducedMotion();
  const n = events.length;
  const [cur, setCur] = useState(0);
  const root = useRef<HTMLElement>(null);
  const door = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const stopped = useRef(false);
  const visible = useRef(false);
  const timer = useRef(0);
  const drag = useRef<{ x: number; y: number } | null>(null);

  const show = useCallback((i: number) => setCur(((i % n) + n) % n), [n]);
  const stop = useCallback(() => {
    stopped.current = true;
    window.clearTimeout(timer.current);
  }, []);

  // move on by themselves while on screen, until the guest takes over
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

  // phones: keep the current event's name in view in the strip beneath the doorway
  useEffect(() => {
    const strip = rail.current;
    const item = strip?.querySelectorAll<HTMLElement>('.ev-rail-item')[cur];
    if (!strip || !item || strip.scrollWidth <= strip.clientWidth) return;
    strip.scrollTo({ left: item.offsetLeft + item.offsetWidth / 2 - strip.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [cur, reduced]);

  // the doorway and the list come up as the section arrives
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from([door.current, rail.current], {
        opacity: 0,
        y: 26,
        duration: 0.9,
        stagger: 0.15,
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
  const theme = (e: WeddingEvent): EventTheme => e.theme ?? "muhurtham";
  const t = THEMES[theme(events[cur])];

  return (
    <section
      ref={root}
      id="events"
      aria-labelledby="events-heading"
      className="cobalt ev-section relative"
      style={{ ["--ev-accent" as string]: t.accent, ["--ev-soft" as string]: t.soft } as CSSProperties}
      onPointerDown={stop}
      onKeyDown={stop}
    >
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "var(--sky-top)" }} />
      <h2 id="events-heading" className="sr-only">
        The wedding celebrations
      </h2>

      <div className="ev-stage">
        {/* the doorway (the same for every event) with each event's own ornaments around it */}
        <div ref={door} className="ev-door">
          {events.map((e, i) => (
            <ThemeDecor key={e.id} theme={theme(e)} active={i === cur} />
          ))}
          <DoorTop />
          <div className="ev-door-body">
            <Pillar side="l" />
            <div
              className="ev-panel"
              role="region"
              aria-roledescription="carousel"
              aria-label="Wedding events"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "ArrowRight" || ev.key === "ArrowDown") (ev.preventDefault(), byGuest(cur + 1));
                else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") (ev.preventDefault(), byGuest(cur - 1));
              }}
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={() => (drag.current = null)}
            >
              <div className="ev-track" style={{ transform: `translateX(${-cur * 100}%)` }}>
                {events.map((e, i) => (
                  <div
                    key={e.id}
                    className={`ev-slide ${i === cur ? "is-on" : ""}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${n}: ${e.name}`}
                    aria-hidden={i !== cur}
                    inert={i !== cur}
                    style={{ ["--ev-accent" as string]: THEMES[theme(e)].accent } as CSSProperties}
                  >
                    <EventText e={e} i={i} n={n} timeZone={wedding.timeZone} />
                  </div>
                ))}
              </div>
            </div>
            <Pillar side="r" />
          </div>
          <DoorBase />
        </div>

        {/* the list of events: a slim rail in the sky to the right (a strip beneath on phones) */}
        {n > 1 && (
          <nav ref={rail} className="ev-rail" aria-label="Choose an event">
            <ol>
              {events.map((e, i) => (
                <li key={e.id}>
                  <button type="button" aria-current={i === cur ? "true" : undefined} onClick={() => byGuest(i)} className="ev-rail-item">
                    <span aria-hidden className="ev-rail-mark">
                      <svg viewBox="-6 -6 12 12">
                        <path d="M0-5 5 0 0 5-5 0Z" />
                      </svg>
                    </span>
                    <span className="ev-rail-num">{two(i + 1)}</span>
                    <span aria-hidden className="ev-rail-dash" />
                    <span className="ev-rail-name">{e.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </section>
  );
}
