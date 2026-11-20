import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { mapsUrl } from "@/lib/format";
import type { EventTheme, WeddingEvent } from "@/config/types";

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

/*
 * The painted temple doorway (events-door, 860×742: gopuram crest, carved arch with
 * jasmine garlands and bells, a brass lamp, carved pillars, banana leaves, brass lamps
 * and a stepped pedestal with a lotus), its sky cut away and its panel left plain.
 * Rows of the art: the event's words sit on the ivory panel from PANEL_TOP down to
 * PANEL_BOTTOM; when they need more room, only the plain middle of the pillars
 * (rows SLICE_TOP–SLICE_END) is drawn taller, so the crest, arch and pedestal keep their shape.
 */
const DOOR = "/media/events-door.webp";
const ART_W = 860;
const ART_H = 742;
const PANEL_TOP = 250;
const PANEL_BOTTOM = 700;
const SLICE_TOP = 340;
const SLICE_END = 530;

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
function EventText({ e, i, n, timeZone, venueQuery }: { e: WeddingEvent; i: number; n: number; timeZone: string; venueQuery?: string }) {
  const maps = e.mapsQuery ?? venueQuery; // the event's own place, else the wedding venue
  const w = when(e, timeZone);
  return (
    <div className="ev-text">
      <p className="ev-count">
        {two(i + 1)} / {two(n)}
      </p>
      <h3 className="ev-name" data-fit=".ev-text">{e.name}</h3>
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
          {maps && (
            <a href={mapsUrl(maps)} target="_blank" rel="noopener noreferrer" className="ev-map">
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
              Get Directions
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
 * The celebrations, on red silk cloth: one painted golden temple doorway (crest,
 * garlands and bells, carved pillars, banana leaves, brass lamps, a pedestal with
 * a lotus) holding one event at a time on its ivory panel. The doorway never
 * changes; each event's words glide in sideways like turning the page of an
 * invitation. The events are listed
 * on a slim rail in the sky to the right (beneath the doorway on phones); swipe,
 * the arrow keys or the list change the event, and they move on by themselves
 * every few seconds until the guest takes over.
 */
export function EventsSlider() {
  const { events, wedding, venue } = useWedding();
  const reduced = usePrefersReducedMotion();
  const n = events.length;
  const [cur, setCur] = useState(0);
  const [touched, setTouched] = useState(false);
  const root = useRef<HTMLElement>(null);
  const door = useRef<HTMLDivElement>(null);
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

  // the doorway: its natural shape, plus taller pillars when the words need room
  const art = useRef<Record<string, HTMLDivElement | null>>({});
  const setArt = (k: string) => (el: HTMLDivElement | null) => void (art.current[k] = el);
  useLayoutEffect(() => {
    const $ = art.current;
    if (!$.box || !$.panel) return;
    const fit = () => {
      const W = $.box!.offsetWidth;
      const k = W / ART_W;
      const Hn = ART_H * k;
      const room = (PANEL_BOTTOM - PANEL_TOP) * k;
      const need = Math.max(...[...$.panel!.querySelectorAll<HTMLElement>(".ev-text")].map((t) => t.offsetHeight));
      const extra = Math.max(0, need - room);
      const slice = (SLICE_END - SLICE_TOP) * k;
      const f = (slice + extra) / slice;
      $.box!.style.height = `${Hn + extra}px`;
      $.top!.style.height = `${SLICE_TOP * k}px`;
      Object.assign($.mid!.style, { top: `${SLICE_TOP * k}px`, height: `${slice + extra}px`, backgroundSize: `100% ${Hn * f}px`, backgroundPosition: `center ${-SLICE_TOP * k * f}px` });
      $.bot!.style.height = `${(ART_H - SLICE_END) * k}px`;
      Object.assign($.panel!.style, { top: `${PANEL_TOP * k}px`, height: `${room + extra}px` });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe($.box);
    $.panel.querySelectorAll(".ev-text").forEach((t) => ro.observe(t));
    return () => ro.disconnect();
  }, [n]);

  // the doorway comes up as the section arrives
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(door.current, {
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
    setTouched(true);
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
      className="ev-cloth ev-section relative"
      style={{ ["--ev-accent" as string]: t.accent, ["--ev-soft" as string]: t.soft, ["--door-art" as string]: `image-set(url("${DOOR}") 1x, url("${DOOR.replace(/\.webp$/, "@2x.webp")}") 2x)` } as CSSProperties}
      onPointerDown={stop}
      onKeyDown={stop}
    >
      <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#870606" }} />
      <h2 id="events-heading" className="sr-only">
        The wedding celebrations
      </h2>

      <div className="ev-stage">
        {/* the doorway (the same for every event) with each event's own ornaments around it */}
        <div ref={door} className="ev-door">
          <div
            ref={setArt("box")}
            className="ev-door-art"
            role="img"
            aria-label="A carved golden temple doorway with jasmine garlands and bells, banana leaves and brass lamps"
          >
            <div ref={setArt("top")} className="ev-door-slice" style={{ top: 0, backgroundPosition: "center top" }} />
            <div ref={setArt("mid")} className="ev-door-slice" />
            <div ref={setArt("bot")} className="ev-door-slice" style={{ bottom: 0, backgroundPosition: "center bottom" }} />
            <div
              ref={setArt("panel")}
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
                  >
                    <EventText e={e} i={i} n={n} timeZone={wedding.timeZone} venueQuery={venue.mapsQuery} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* arrows on both sides to change the event; a tapping hand shows the way until the guest uses them */}
        {n > 1 && (
          <>
            <button type="button" className="ev-arrow ev-arrow--prev" aria-label="Previous event" onClick={() => byGuest(cur - 1)}>
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button type="button" className="ev-arrow ev-arrow--next" aria-label="Next event" onClick={() => byGuest(cur + 1)}>
              <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
              {!touched && (
                <svg viewBox="0 0 40 48" aria-hidden className="ev-tap-hand">
                  <path d="M15 22V8a3 3 0 0 1 6 0v11l1-1a3 3 0 0 1 5 2v1a3 3 0 0 1 5 1v1a3 3 0 0 1 5 1v8c0 7-5 12-12 12h-2c-4 0-7-2-9-5l-6-9a3 3 0 0 1 4-4l3 3Z" fill="#fbf2dc" stroke="#5e1220" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
