import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
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
        { y: () => window.innerHeight * 0.3 },
        { y: 0, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: SCRUB, invalidateOnRefresh: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-line]", r.current.col).forEach((el) =>
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
      );
      // the hairlines draw out from the centre
      gsap.utils.toArray<HTMLElement>(".iv-rule", r.current.col).forEach((el) =>
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
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
      <div aria-hidden className="h-[96px]" />
      {/* the mandapam: full width, at least 31.75rem (on phones the pillars sit at the screen edges) */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "max(31.75rem, 100vw)" }}>
        <div ref={set("box")} data-layer className="relative w-full">
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

          {/* the opening between the pillars: the letter, straight on the cream */}
          <div
            ref={set("open")}
            className="absolute flex items-center justify-center"
            style={{ left: `${(OPEN.left / ARCH_W) * 100}%`, right: `${(1 - OPEN.right / ARCH_W) * 100}%` }}
          >
            <div ref={set("col")} className="iv-letter">
              <img data-line src="/media/kalash.webp" alt="" className="iv-kalash" draggable={false} />
              {wedding.invocation && (
                <p data-line className="iv-invocation">
                  {wedding.invocation}
                </p>
              )}
              <p data-line className="iv-dear">
                Dear <span data-fit=".iv-letter">{guestName}</span>,
              </p>
              <p data-line className="iv-script" aria-hidden>
                Invite
              </p>
              <span aria-hidden className="iv-rule" />
              <p data-line className="iv-small">
                With the blessings of the Almighty and our beloved elders
              </p>
              <p data-line className="iv-small iv-family">
                {parents(first.parents)}
                <br />
                <em>together with</em>
                <br />
                {parents(second.parents)}
              </p>
              <p data-line className="iv-small">
                request the pleasure of your company at the wedding of their children
              </p>

              <h2 id="invite-heading" className="iv-names">
                <span data-line className="iv-name" data-fit=".iv-letter">
                  {first.name}
                </span>
                <span data-line className="iv-amp">
                  <span className="sr-only">and</span>
                  <span aria-hidden>&amp;</span>
                </span>
                <span data-line className="iv-name" data-fit=".iv-letter">
                  {second.name}
                </span>
              </h2>

              <span aria-hidden className="iv-rule" />
              <p data-line className="iv-date">
                {date.weekday}
                <span aria-hidden className="iv-dot" />
                {date.day} {date.month} {date.year}
              </p>
              <p data-line className="iv-small">Muhurtham · {wedding.muhurthamLabel}</p>
              <p data-line className="iv-venue">{venue.name}</p>
              <p data-line className="iv-small">{venue.address ?? wedding.city}</p>
              <span aria-hidden className="iv-rule" />
              <p data-line className="iv-small iv-closing">
                and the celebrations that follow
              </p>
              <p data-line className="iv-families">{wedding.families}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
