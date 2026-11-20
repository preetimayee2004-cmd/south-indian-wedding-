import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Countdown } from "@/components/ui/Countdown";
import { mapsUrl } from "@/lib/format";
import { TempleHeroScene } from "./TempleHeroScene";

/** The temple mandapam: tiled roof on two pillars over a carved plinth with steps in the middle
 *  (1192×742, cropped; its flat blue background keyed out and its colours matched to the hero
 *  with scripts/match-hero-colours.mjs). */
const ARCH = "/media/invite-arch.webp";
const ARCH_W = 1192;
const ARCH_H = 742;
/** The brass lamps, lotus bowls and steps that stand in front (x 348–848, y 511–742 of the art). */
const FRONT = { src: "/media/invite-arch-front.webp", left: 348 / ARCH_W, width: 500 / ARCH_W, ratio: "1000 / 462" };
/** Rows of the art: the roof, lintel and capitals end at SLICE_TOP; the plain fluted stretch of
 *  the pillars that can be drawn taller runs to SLICE_END. */
const SLICE_TOP = 416;
const SLICE_END = 506;
/** Where the letter sits, in rows/columns of the art: under the lintel, between the pillars,
 *  ending above the lamps' flames. */
const OPEN = { top: 300, bottom: 512, left: 168, right: 1024 };
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

/** Small ornamental corner motif for the inner luxury card (kolam/lotus). */
const CORNER_LOTUS = (
  <svg viewBox="0 0 32 32" aria-hidden className="iv-card-corner-svg">
    <path d="M2 16 V5 C2 3.3 3.3 2 5 2 H16" fill="none" stroke="#d4af37" strokeWidth="1" strokeLinecap="round" />
    <path d="M6 14 V7 C6 6.4 6.4 6 7 6 H14" fill="none" stroke="#e2b84f" strokeWidth="0.8" strokeLinecap="round" opacity="0.85" />
    <path d="M6 6 C9 9, 12 13, 8 16 C6 13, 6 9, 6 6 Z" fill="#e2b84f" />
    <path d="M6 6 C9 9, 13 12, 16 8 C13 6, 9 6, 6 6 Z" fill="#e2b84f" />
    <path d="M6 6 C10 10, 14 14, 12 17 C10 18, 9 17, 8 15 C8 13, 6 10, 6 6 Z" fill="#8a5a14" />
    <circle cx="6" cy="6" r="1.5" fill="#8a5a14" />
    <polygon points="6,6 8,4 10,6 8,8" fill="#e2b84f" />
    <circle cx="19" cy="2" r="1.1" fill="#d4af37" />
    <circle cx="2" cy="19" r="1.1" fill="#d4af37" />
  </svg>
);

/** Faint traditional kolam / mandala watermark for the luxury card. */
const MANDALA_WATERMARK = (
  <svg viewBox="-120 -120 240 240" aria-hidden className="iv-mandala-svg">
    <g fill="none" stroke="#8a5a14" strokeWidth="0.8">
      <circle r="114" strokeWidth="0.6" strokeDasharray="3 4" />
      <circle r="106" strokeWidth="0.8" />
      <circle r="98" strokeWidth="0.5" />
      <circle r="74" strokeWidth="0.8" />
      <circle r="52" strokeWidth="0.6" strokeDasharray="2 3" />
      <circle r="36" strokeWidth="0.8" />
      <circle r="18" strokeWidth="0.7" />
      <circle r="6" fill="#8a5a14" />
      {Array.from({ length: 16 }, (_, i) => (
        <g key={`p1-${i}`} transform={`rotate(${i * 22.5})`}>
          <path d="M0 -74 C6 -87, 10 -98, 0 -106 C-10 -98, -6 -87, 0 -74 Z" fill="#e2b84f" fillOpacity="0.18" />
          <circle cx="0" cy="-90" r="1.5" fill="#8a5a14" />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`p2-${i}`} transform={`rotate(${i * 45})`}>
          <path d="M0 -36 C8 -44, 10 -60, 0 -74 C-10 -60, -8 -44, 0 -36 Z" fill="#8a5a14" fillOpacity="0.14" />
          <path d="M0 -18 C5 -24, 6 -32, 0 -36 C-6 -32, -5 -24, 0 -18 Z" fill="#e2b84f" fillOpacity="0.22" />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={`l-${i}`} d="M0 -52 C12 -58, 20 -44, 26 -36" transform={`rotate(${i * 45})`} strokeWidth="0.6" />
      ))}
    </g>
  </svg>
);

/** Thin gold line with a centered ornamental diamond/lotus motif. */
function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div data-line aria-hidden className={`iv-divider ${className}`}>
      <span className="iv-divider-line iv-divider-line--l" />
      <svg viewBox="-14 -8 28 16" className="iv-divider-motif">
        <path d="M0 -6 C2 -3.2, 3 -1, 0 2.2 C-3 -1, -2 -3.2, 0 -6 Z" fill="#e2b84f" />
        <path d="M-1.2 1.6 C-4.8 1.2, -6.8 -1, -7.5 -3.8 C-4.6 -3, -2.2 -1.2, -1.2 1.6 Z" fill="#a87420" />
        <path d="M1.2 1.6 C4.8 1.2, 6.8 -1, 7.5 -3.8 C4.6 -3, 2.2 -1.2, 1.2 1.6 Z" fill="#a87420" />
        <polygon points="0,3.5 2.4,6 0,8.5 -2.4,6" fill="#8a5a14" />
        <circle cx="-11" cy="0" r="1.3" fill="#e2b84f" />
        <circle cx="11" cy="0" r="1.3" fill="#e2b84f" />
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
      const extra = Math.max(0, $.col!.offsetHeight - room);
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
          gsap.fromTo(
            batch,
            { opacity: 0, y: 18, filter: "blur(5px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.12, ease: "power2.out" },
          );
        },
      });
      // the ornamental divider lines draw out from the centre
      gsap.utils.toArray<HTMLElement>(".iv-divider-line", r.current.col).forEach((el) =>
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
            className="absolute flex items-center justify-center"
            style={{ left: `${(OPEN.left / ARCH_W) * 100}%`, right: `${(1 - OPEN.right / ARCH_W) * 100}%` }}
          >
            <div ref={set("col")} className="iv-letter">
              <div className="iv-card-panel">
                <div className="iv-card-inner">
                  {/* Small ornamental corner motifs (kolam/lotus, SVG) */}
                  <span aria-hidden className="iv-corner-motif iv-corner-motif--tl">{CORNER_LOTUS}</span>
                  <span aria-hidden className="iv-corner-motif iv-corner-motif--tr">{CORNER_LOTUS}</span>
                  <span aria-hidden className="iv-corner-motif iv-corner-motif--bl">{CORNER_LOTUS}</span>
                  <span aria-hidden className="iv-corner-motif iv-corner-motif--br">{CORNER_LOTUS}</span>

                  {/* Faint kolam/mandala watermark at 4-6% opacity */}
                  <div aria-hidden className="iv-card-watermark">
                    {MANDALA_WATERMARK}
                  </div>

                  {/* Top Kalash & Invocation */}
                  <img data-line src="/media/kalash.webp" alt="" className="iv-kalash" draggable={false} />
                  {wedding.invocation && (
                    <p data-line className="iv-invocation">
                      {wedding.invocation}
                    </p>
                  )}
                  <p data-line className="iv-dear">
                    Dear <span data-fit=".iv-card-inner">{guestName}</span>,
                  </p>
                  <p data-line className="iv-script" aria-hidden>
                    Invite
                  </p>
                  <p data-line className="iv-lead">Some moments are too precious to celebrate without the people we love.</p>
                  
                  {/* Blessings & Parents */}
                  <p data-line className="iv-small iv-blessing-text">
                    With the blessings of the Almighty and our beloved elders
                  </p>
                  <p data-line className="iv-family">
                    {parents(first.parents)}
                    <span className="iv-together">together with</span>
                    {parents(second.parents)}
                  </p>
                  <p data-line className="iv-small">
                    request the pleasure of your company at the wedding of their children
                  </p>

                  {/* Divider between blessings and names */}
                  <OrnamentalDivider />

                  {/* Couple Names */}
                  <h2 id="invite-heading" className="iv-names">
                    <span data-line className="iv-name" data-fit=".iv-card-inner">
                      {first.name}
                    </span>
                    <span data-line className="iv-amp">
                      <span className="sr-only">and</span>
                      <span aria-hidden>&amp;</span>
                    </span>
                    <span data-line className="iv-name" data-fit=".iv-card-inner">
                      {second.name}
                    </span>
                  </h2>

                  {/* Divider between names and date */}
                  <OrnamentalDivider />

                  {/* Date: 15 FEBRUARY 2027 in gold-bordered pill with MONDAY above and Muhurtham below */}
                  <div data-line className="iv-date-section">
                    <p className="iv-label-tracked">{date.weekday}</p>
                    <div className="iv-date-pill">
                      <span className="iv-date-pill-text">
                        {date.day} {date.month.toUpperCase()} {date.year}
                      </span>
                    </div>
                    {wedding.muhurthamLabel && (
                      <p className="iv-muhurtham-label">
                        Muhurtham · {wedding.muhurthamLabel}
                      </p>
                    )}
                  </div>

                  {/* Divider between date and countdown */}
                  <OrnamentalDivider />

                  {/* Countdown */}
                  <p data-line className="iv-label-tracked">
                    COUNTING THE DAYS
                  </p>
                  <div data-line className="iv-countdown">
                    <Countdown iso={wedding.dateISO} />
                  </div>

                  {/* Divider between countdown and venue */}
                  <OrnamentalDivider />

                  {/* Destination */}
                  <p data-line className="iv-label-tracked">
                    THE DESTINATION
                  </p>
                  <p data-line className="iv-venue">{venue.name}</p>
                  <p data-line className="iv-venue-address">{venue.address ?? wedding.city}</p>
                  <a
                    data-line
                    className="iv-directions"
                    href={mapsUrl(venue.mapsQuery ?? `${venue.name}, ${venue.address ?? wedding.city}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg aria-hidden viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                    Get directions
                  </a>

                  {/* Divider between venue and closing */}
                  <OrnamentalDivider />

                  {/* Celebrations & Families */}
                  <p data-line className="iv-closing">
                    and the celebrations that follow
                  </p>
                  <p data-line className="iv-families">{wedding.families}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
