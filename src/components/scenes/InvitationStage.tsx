import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Countdown } from "@/components/ui/Countdown";
import { mapsUrl } from "@/lib/format";
import { TempleHeroScene } from "./TempleHeroScene";

const TOUCH = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/** The temple mandapam: tiled roof on two pillars over a carved plinth with steps in the middle
 *  (1192×742, cropped; its flat blue background keyed out and its colours matched to the hero
 *  with scripts/match-hero-colours.mjs). */
const ARCH = "/media/invite-arch.webp";
const ARCH_W = 1192;
const ARCH_H = 742;
/** The brass lamps, lotus bowls and steps that stand in front (x 348–848, y 511–742 of the art). */
const FRONT = { src: "/media/invite-arch-front.webp", left: 348 / ARCH_W, width: 500 / ARCH_W, ratio: "1000 / 462" };
const FRONT_TOP = 511;
/** Rows of the art: the roof, lintel and capitals end at SLICE_TOP; the plain fluted stretch of
 *  the pillars that can be drawn taller runs to SLICE_END. */
const SLICE_TOP = 416;
const SLICE_END = 506;
/** Where the letter sits, in rows/columns of the art: under the lintel, between the pillars,
 *  ending above the lamps' flames. */
const OPEN = { top: 292, bottom: 596, left: 158, right: 1034 };
/** The cream between the pillars (under the lintel, down to the plinth, tucked under the shafts):
 *  everything else behind the mandapam is filled with the carved, painted gopuram. */
const CREAM = { top: 288, bottom: 596, left: 140, right: 1052 };
/** The visible opening between the pillar shafts, where the frame's decorations hang. */
const DECO = { top: 292, bottom: 596, left: 158, right: 1034 };
/** A gold filigree corner (top-left; mirrored for the others). */
const CORNER = (
  <svg viewBox="0 0 64 64" aria-hidden>
    <path d="M3 61V17C3 9 9 3 17 3H61" fill="none" stroke="#c9a24e" strokeWidth="2.2" />
    <path d="M11 55V20c0-5 4-9 9-9h35" fill="none" stroke="#c9a24e" strokeWidth="1" />
    <path d="M17 17c9 0 14 5 14 13-5 0-9-2-11.5-6.5C17 28 13 30 8 30c0-8 4-13 9-13Z" fill="#d9b25f" stroke="#8a6420" strokeWidth=".6" />
    <circle cx="17" cy="17" r="3.4" fill="#7a1f2b" stroke="#c9a24e" strokeWidth="1.2" />
    <path d="M36 11c4 0 6 2 6 5M11 36c0 4 2 6 5 6" fill="none" stroke="#c9a24e" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
/** A cluster of jasmine with two mango leaves. */
const JASMINE = (
  <svg viewBox="-24 -20 48 40" aria-hidden>
    <path d="M0 2c-12-4-20 1-22 9 9 2 17-1 22-9Z" fill="#4f8a3a" />
    <path d="M0 2c12-4 20 1 22 9-9 2-17-1-22-9Z" fill="#3f7a2e" />
    {[[0, -8], [-8, -2], [8, -2], [-4, 6], [5, 6]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} rx="2.2" ry="4.4" cy="-3.6" transform={`rotate(${r})`} fill="#fffaf0" stroke="#ddd2b6" strokeWidth=".5" />
        ))}
        <circle r="1.5" fill="#e9b949" />
      </g>
    ))}
  </svg>
);


/** Thin gold line with a centered ornamental diamond/lotus motif. */
function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div data-line aria-hidden className={`gn-orn ${className}`}>
      <span className="iv-divider-line iv-divider-line--l" />
      <svg viewBox="-20 -14 40 24" aria-hidden="true" className="gn-orn-motif">
        <path d="M0 8Q-6 0 0-12Q6 0 0 8Z" fill="#e8b04a" />
        <path d="M0 8Q-13 3-15-6Q-5-5 0 8Z" fill="#d9972e" />
        <path d="M0 8Q13 3 15-6Q5-5 0 8Z" fill="#d9972e" />
      </svg>
      <span className="iv-divider-line iv-divider-line--r" />
    </div>
  );
}

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

export function InvitationStage() {
  return (
    <>
      <TempleHeroScene tail={0} />
      <ArchScene />
    </>
  );
}

/**
 * The invitation, written straight onto the cream between the mandapam's pillars (no card):
 * the pillars simply grow taller to hold the whole letter, so the roof, the words and the
 * plinth with its lamps read as one painted page. Quiet type — a teal "Invite" in script,
 * small warm-grey lines, the names in tall gold capitals — and each line fades up in turn.
 */
export function ArchScene() {
  const { couple, wedding, venue } = useWedding();
  const { guestName } = useGuest();
  const reduced = usePrefersReducedMotion();
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const parents = (p?: string) => (p ?? "").replace(/^[DS]\/o\s*/i, "");

  const root = useRef<HTMLElement>(null);
  const r = useRef<Record<string, HTMLElement | null>>({});
  const set = (k: string) => (el: HTMLElement | null) => void (r.current[k] = el);

  // size the mandapam to its letter: the natural painting, plus taller pillars where needed
  useLayoutEffect(() => {
    const $ = r.current;
    const fit = () => {
      const W = $.box!.offsetWidth;
      const k = W / ARCH_W;
      const Hn = ARCH_H * k;
      const room = (OPEN.bottom - OPEN.top) * k;
      // the lamps and steps in front cover the foot of the opening (from art row 511):
      // pad the letter by that much, so its last lines are never hidden behind them
      $.col!.style.paddingBottom = `${Math.round((OPEN.bottom - FRONT_TOP) * k + 8)}px`;
      // measure the letter's own content (it grows once the web fonts arrive), not its frame
      // (.iv-card-inner is stretched to the letter's full height by min-height: 100%, so measure it
      // with that switched off for a moment — else the pillars could only ever grow, never shrink back)
      const inner = $.col!.querySelector<HTMLElement>(".iv-card-inner");
      const cs = getComputedStyle($.col!);
      let content = $.col!.offsetHeight;
      if (inner) {
        const prev = inner.style.minHeight;
        inner.style.minHeight = "0px";
        content = inner.offsetHeight;
        inner.style.minHeight = prev;
      }
      const need = inner ? content + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) : content;
      const extra = Math.max(0, need - room);
      const slice = (SLICE_END - SLICE_TOP) * k;
      const f = (slice + extra) / slice;
      $.box!.style.height = `${Hn + extra}px`;
      $.top!.style.height = `${SLICE_TOP * k}px`;
      Object.assign($.mid!.style, {
        top: `${SLICE_TOP * k}px`,
        height: `${slice + extra}px`,
        backgroundSize: `100% ${Hn * f}px`,
        backgroundPosition: `center ${-SLICE_TOP * k * f}px`,
      });
      $.bot!.style.height = `${(ARCH_H - SLICE_END) * k}px`;
      Object.assign($.open!.style, { top: `${OPEN.top * k}px`, height: `${room + extra}px` });
      Object.assign($.deco!.style, { top: `${DECO.top * k}px`, height: `${(DECO.bottom - DECO.top) * k + extra}px` });
      Object.assign($.cream!.style, { top: `${CREAM.top * k}px`, height: `${(CREAM.bottom - CREAM.top) * k + extra}px` });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe($.col!);
    ro.observe($.box!);
    const inner = $.col!.querySelector<HTMLElement>(".iv-card-inner");
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      // the mandapam rises a little faster than the page and docks as it arrives
      gsap.fromTo(
        r.current.box,
        { y: () => window.innerHeight * 0.08 },
        { y: 0, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: SCRUB, invalidateOnRefresh: true } },
      );
      // Each section fades up with a slight blur-to-sharp reveal on scroll, staggered by 120ms
      const lines = gsap.utils.toArray<HTMLElement>("[data-line]", r.current.col);
      ScrollTrigger.batch(lines, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          // phones: no blur (blurring many text lines at once is what made scrolling stutter there)
          const soft = !TOUCH;
          gsap.fromTo(
            batch,
            { opacity: 0, y: 18, ...(soft && { filter: "blur(5px)" }) },
            { opacity: 1, y: 0, ...(soft && { filter: "blur(0px)", clearProps: "filter" }), duration: 0.9, stagger: 0.12, ease: "power2.out" },
          );
        },
      });
      // the ornamental divider lines draw out from the centre flower
      gsap.utils.toArray<HTMLElement>(".iv-divider-line--l", r.current.col).forEach((el) =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
      );
      gsap.utils.toArray<HTMLElement>(".iv-divider-line--r", r.current.col).forEach((el) =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const art = `url("${ARCH.replace(/\.webp$/, "@2x.webp")}")`;
  const layer = { backgroundImage: art, backgroundRepeat: "no-repeat" } as const;

  return (
    <section ref={root} id="invitation" aria-labelledby="invite-heading" className="parchment-ground relative overflow-x-clip pb-10">
      {/* the temple's stone floor ends here on a carved kerb, then parchment */}
      <div aria-hidden className="ground-kerb" />
      <div aria-hidden className="h-[clamp(36px,6.5vw,96px)]" />
      {/* the mandapam: the full screen width, the whole of it in view on phones as on laptops */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "100vw" }}>
        <div ref={set("box")} data-layer className="relative w-full">
          {/* behind the mandapam: the gopuram's tiers of painted deities, cornices and kudus */}
          <div aria-hidden className="iv-temple" />
          <div
            aria-hidden
            ref={set("cream")}
            className="iv-cream parchment-ground absolute"
            style={{ left: `${(CREAM.left / ARCH_W) * 100}%`, right: `${(1 - CREAM.right / ARCH_W) * 100}%` }}
          />
          <div aria-hidden ref={set("top")} className="absolute inset-x-0 top-0" style={{ ...layer, backgroundSize: "100% auto", backgroundPosition: "center top" }} />
          <div aria-hidden ref={set("mid")} className="absolute inset-x-0" style={layer} />
          <div aria-hidden ref={set("bot")} className="absolute inset-x-0 bottom-0" style={{ ...layer, backgroundSize: "100% auto", backgroundPosition: "center bottom" }} />
          <img
            aria-hidden
            src={FRONT.src}
            alt=""
            decoding="async"
            className="pointer-events-none absolute bottom-0 z-[2]"
            style={{ left: `${FRONT.left * 100}%`, width: `${FRONT.width * 100}%`, aspectRatio: FRONT.ratio }}
            draggable={false}
          />

          {/* the frame's decorations, like the gallery's: a gold double frame with filigree corners and a
              lotus crest, jasmine swags under the lintel, jasmine strings down the sides and clusters at
              the corners, and two brass deepams hanging on chains */}
          <div
            aria-hidden
            ref={set("deco")}
            className="iv-deco pointer-events-none absolute"
            style={{ left: `${(DECO.left / ARCH_W) * 100}%`, right: `${(1 - DECO.right / ARCH_W) * 100}%` }}
          >
            <div className="iv-frame">
              {(["tl", "tr", "bl", "br"] as const).map((c) => (
                <span key={c} className={`iv-corner iv-corner--${c}`}>
                  {CORNER}
                </span>
              ))}
              <svg className="iv-crest" viewBox="0 0 120 40">
                <path d="M2 34c14 0 22-4 30-12 6-6 12-8 18-6-6 2-9 6-9 10 4-3 9-4 14-1-7 1-10 4-11 9H2Z" fill="#d9b25f" stroke="#8a6420" strokeWidth=".7" />
                <path d="M118 34c-14 0-22-4-30-12-6-6-12-8-18-6 6 2 9 6 9 10-4-3-9-4-14-1 7 1 10 4 11 9h42Z" fill="#d9b25f" stroke="#8a6420" strokeWidth=".7" />
                <path d="M60 4c6 6 6.6 12 0 18-6.6-6-6-12 0-18ZM57.2 23c-8.4-.8-12.8-6-13.6-12 6 1.2 11.2 4.8 13.6 12ZM62.8 23c8.4-.8 12.8-6 13.6-12-6 1.2-11.2 4.8-13.6 12ZM43 26c7.2 4.4 26.8 4.4 34 0" fill="#d9b25f" stroke="#8a6420" strokeWidth=".8" />
                <circle cx="60" cy="31" r="3.2" fill="#7a1f2b" stroke="#c9a24e" strokeWidth="1" />
              </svg>
            </div>
            <div className="tw-swags iv-swags" />
            <span className="iv-strand iv-strand--l" />
            <span className="iv-strand iv-strand--r" />
            {(["tl", "tr", "bl", "br"] as const).map((c) => (
              <span key={c} className={`iv-jasmine iv-jasmine--${c}`}>
                {JASMINE}
              </span>
            ))}
            {(["l", "r"] as const).map((side) => (
              <span key={side} className={`iv-deepam iv-deepam--${side}`}>
                <span className="iv-deepam-chain" />
                <svg viewBox="-22 -48 44 64">
                  <path className="ic-oil-flame" d="M0-44C4-37 4-31 0-27-4-31-4-37 0-44Z" />
                  <path d="M-12-26 0-46 12-26" fill="none" stroke="#b8893e" strokeWidth=".9" />
                  <path d="M-17-26C-17-17-9-12 0-12S17-17 17-26Z" fill="#c8961e" stroke="#7a5418" strokeWidth=".9" />
                  <ellipse cy="-26" rx="17" ry="3.8" fill="#e9c46a" stroke="#7a5418" strokeWidth=".8" />
                  <path d="M-7-12H7L4-4H-4Z" fill="#b8862e" stroke="#7a5418" strokeWidth=".7" />
                  <path d="M0-4 0 6" stroke="#b8893e" strokeWidth="1.2" />
                  <circle cy="9" r="3" fill="#c8961e" stroke="#7a5418" strokeWidth=".7" />
                </svg>
              </span>
            ))}
          </div>

          {/* the opening between the pillars: the luxury wedding card */}
          <div
            ref={set("open")}
            className="absolute flex items-start justify-center"
            style={{ left: `${(OPEN.left / ARCH_W) * 100}%`, right: `${(1 - OPEN.right / ARCH_W) * 100}%` }}
          >
            <div ref={set("col")} className="iv-letter">
              <div className="iv-card-panel">
                <div className="iv-card-inner">
                  {/* Block 1: Kalash, Invocation, Dear Guest, Quote */}
                  <div className="gn-blk">
                    <img data-line src="/media/kalash.webp" alt="Shri Ganesh" className="gn-ganesh" draggable={false} />
                    {wedding.invocation && (
                      <p data-line className="gn-shri" lang="hi">
                        {wedding.invocation}
                      </p>
                    )}
                    <p data-line className="gn-dear">Dear</p>
                    <p data-line className="gn-name">
                      <span className="q">“</span><span data-fit=".iv-card-inner">{guestName}</span><span className="q">”</span>
                    </p>
                    <p data-line className="gn-quote">Some moments are too precious to celebrate without the people we love.</p>
                  </div>

                  <OrnamentalDivider />

                  {/* Block 2: Welcome, Parents, Couple Names, Shubh Vivah */}
                  <div className="gn-blk">
                    <p data-line className="gn-welcome">
                      With the blessings of our elders, we warmly invite you to the wedding celebrations of
                    </p>
                    {parents(first.parents) && (
                      <div data-line className="gn-parents">
                        <p className="gn-par">{parents(first.parents)}</p>
                        <span className="gn-par-and">together with</span>
                        <p className="gn-par">{parents(second.parents)}</p>
                      </div>
                    )}
                    <h2 id="invite-heading" className="gn-names">
                      <span aria-hidden className="gn-halo" />
                      <span data-line className="gn-n" data-fit=".iv-card-inner">
                        {first.name}
                      </span>
                      <span data-line className="gn-amp">
                        <span className="sr-only">and</span>
                        <span aria-hidden>&amp;</span>
                      </span>
                      <span data-line className="gn-n" data-fit=".iv-card-inner">
                        {second.name}
                      </span>
                    </h2>
                    <p data-line className="gn-hi" lang="hi">शुभ विवाह</p>
                  </div>

                  <OrnamentalDivider />

                  {/* Block 3: Date & Muhurtham */}
                  <div className="gn-blk">
                    <p data-line className="gn-cdh">Save the Date</p>
                    <div data-line className="gn-date3">
                      <span className="gn-d-side">{date.weekday}</span>
                      <span className="gn-d-mid">
                        <b>{date.day}</b>
                        <small>{date.month}</small>
                      </span>
                      <span className="gn-d-side">{date.year}</span>
                    </div>
                    {wedding.muhurthamLabel && (
                      <p data-line className="gn-muh">
                        Auspicious Muhurtham · {wedding.muhurthamLabel}
                      </p>
                    )}
                  </div>

                  <OrnamentalDivider />

                  {/* Block 4: Countdown */}
                  <div className="gn-blk" role="timer" aria-label="Countdown to the wedding">
                    <p data-line className="gn-cdh">Counting the Days</p>
                    <div data-line className="w-full flex justify-center">
                      <Countdown iso={wedding.dateISO} />
                    </div>
                    <p data-line className="gn-cdn">until our sacred vows · {date.day} {date.month} {date.year}</p>
                  </div>

                  <OrnamentalDivider />

                  {/* Block 5: The Destination */}
                  <div className="gn-blk">
                    <svg data-line viewBox="0 0 48 48" className="gn-temple" aria-hidden>
                      <path d="M24 4v4M19 9h10l2 6H17l2-6ZM15 15h18l2 7H13l2-7ZM11 22h26l2 8H9l2-8ZM7 30h34v12H7Z" fill="none" stroke="#b8862f" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M20 42v-6a4 4 0 0 1 8 0v6" fill="none" stroke="#b8862f" strokeWidth="1.6" />
                      <circle cx="24" cy="3.5" r="1.6" fill="#c2273d" />
                    </svg>
                    <p data-line className="gn-vh">The Destination</p>
                    <p data-line className="gn-vn">{venue.name}</p>
                    <p data-line className="gn-va">{venue.address ?? wedding.city}</p>
                    <div data-line className="gn-btns">
                      <a
                        className="gn-btn"
                        href={mapsUrl(venue.mapsQuery ?? `${venue.name}, ${venue.address ?? wedding.city}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/>
                          <circle cx="12" cy="10" r="2.3"/>
                        </svg>
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>

                  <OrnamentalDivider />

                  {/* Block 6: Closing Presence & Families */}
                  <div className="gn-blk">
                    <p data-line className="gn-end">We await your gracious presence</p>
                    <p data-line className="gn-sign">— {wedding.families}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
