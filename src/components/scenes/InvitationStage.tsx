import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Countdown } from "@/components/ui/Countdown";
import { mapsUrl } from "@/lib/format";
import { TempleHeroScene } from "./TempleHeroScene";
import { GoldLabel, Kalasam, LotusDivider, LotusMedallion, Pin } from "./invite/Ornaments";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** The temple arch, drawn in the hero temple's style (1249×1765, cropped to the arch; its flat
 *  blue background cut away by scripts/cut-flat-bg.mjs, so the sky shows through). */
const ARCH = "/media/invite-arch.webp";
const ARCH_W = 1249;
const ARCH_H = 1765;
const ARCH_RATIO = ARCH_W / ARCH_H;
/** The opening between the pillars, as fractions of the arch: where the invitation panel sits. */
const PANEL = { top: 0.36, bottom: 0.15, side: 0.21 };

/**
 * The invitation section on phones: scene 1 (hero + temple), then the temple
 * arch rises over it with a scalloped edge and holds the invitation and the
 * celebrations.
 */
export function InvitationStage() {
  return (
    <>
      <TempleHeroScene tail={1} />
      <div className="relative z-[1]" style={{ marginTop: "-100svh" }}>
        <ArchScene />
      </div>
    </>
  );
}

/** Rows of the arch (of ARCH_H): the roof, lintel and capitals end at SLICE_TOP, and the plain
 *  fluted stretch of the pillars that can be drawn taller runs to SLICE_END. */
const SLICE_TOP = 1110;
const SLICE_END = 1460;

/**
 * The painted temple arch with the invitation (as the reference's gate). It
 * rises over the hero on a scalloped edge and docks, then simply scrolls with
 * the page — nothing is pinned, so nothing is ever cut off. The whole letter
 * sits on the cream sheet in the opening: when it needs more room than the
 * arch has, only the plain fluted stretch of the pillars is drawn taller (the
 * roof, capitals and bases keep their shape). Each line fades up as it comes
 * into view: "Dear …", the names, COUNTING THE DAYS (live), THE DESTINATION
 * with directions, and both families' sign-off.
 */
export function ArchScene() {
  const { couple, wedding, venue } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const reduced = usePrefersReducedMotion();
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const root = useRef<HTMLElement>(null);
  const r = useRef<Record<string, HTMLElement | null>>({});
  const set = (k: string) => (el: HTMLElement | null) => void (r.current[k] = el);

  // size the arch to its letter: natural painting, plus extra pillar where needed
  useLayoutEffect(() => {
    const $ = r.current;
    const fit = () => {
      const W = $.box!.offsetWidth;
      const Hn = W / ARCH_RATIO; // the painting's natural height at this width
      const k = Hn / ARCH_H;
      const panelTop = PANEL.top * Hn;
      const panelBottom = PANEL.bottom * Hn;
      const need = $.col!.offsetHeight + 8; // the letter (its padding included)
      const extra = Math.max(0, need - (Hn - panelTop - panelBottom));
      const slice = (SLICE_END - SLICE_TOP) * k;
      const f = (slice + extra) / slice; // how much the plain stretch is drawn taller
      $.box!.style.height = `${Hn + extra}px`;
      Object.assign($.top!.style, { height: `${SLICE_TOP * k}px` });
      Object.assign($.mid!.style, {
        top: `${SLICE_TOP * k}px`,
        height: `${slice + extra}px`,
        backgroundSize: `100% ${Hn * f}px`,
        backgroundPosition: `center ${-SLICE_TOP * k * f}px`,
      });
      Object.assign($.bot!.style, { height: `${(ARCH_H - SLICE_END) * k}px` });
      Object.assign($.panel!.style, { top: `${panelTop}px`, bottom: `${panelBottom}px` });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe($.col!);
    ro.observe($.box!);
    return () => ro.disconnect();
  }, []);

  // the arch rises and docks as it arrives; each line fades up as it comes into view
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        r.current.box,
        { y: () => window.innerHeight * 0.22 },
        { y: 0, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: SCRUB, invalidateOnRefresh: true } },
      );
      const boxes = gsap.utils.toArray<HTMLElement>("[data-box]", r.current.col);
      if (boxes.length)
        gsap.from(boxes, { y: 26, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: boxes[0], start: "top 94%", once: true } });
      gsap.utils.toArray<HTMLElement>("[data-line]", r.current.col).forEach((el) =>
        gsap.from(el, { opacity: 0, y: 18, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 94%", once: true } }),
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const art = `url("${ARCH.replace(/\.webp$/, "@2x.webp")}")`;

  return (
    <section
      ref={root}
      id="invitation"
      aria-labelledby="invite-heading"
      className="cobalt sky-pinned relative overflow-x-clip pb-10"
    >
      {/* the hero's sky, held on the screen so the arch slides over one continuous sky */}
      <div aria-hidden className="sky-layer" />
      <div aria-hidden className="edge edge-scallop-top" />
      {/* the arch: full width, and at least 37rem so the card in its opening holds the countdown in one row
          (on phones the pillars sit at the screen edges); full width on large screens */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "max(37rem, 100vw)" }}>
      <div ref={set("box")} data-layer className="relative w-full" aria-label="A colourful carved temple arch with golden finials and a red tiled roof">
        <div ref={set("top")} className="absolute inset-x-0 top-0" style={{ backgroundImage: art, backgroundSize: "100% auto", backgroundPosition: "center top", backgroundRepeat: "no-repeat" }} />
        <div ref={set("mid")} className="absolute inset-x-0" style={{ backgroundImage: art, backgroundRepeat: "no-repeat" }} />
        <div ref={set("bot")} className="absolute inset-x-0 bottom-0" style={{ backgroundImage: art, backgroundSize: "100% auto", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat" }} />

        {/* the cream sheet in the opening between the pillars */}
        <div
          ref={set("panel")}
          className="absolute flex flex-col justify-center border border-[#d9b25f]/80 text-ink shadow-[0_12px_40px_rgb(5_15_45/0.45)]"
          style={{
            left: `${PANEL.side * 100}%`,
            right: `${PANEL.side * 100}%`,
            borderRadius: "48% 48% 10px 10px / 9rem 9rem 10px 10px",
            background: "radial-gradient(ellipse 70% 30% at 50% 12%, rgb(255 250 235 / 0.7), transparent 70%), #F7ECD3",
          }}
        >
          <div ref={set("col")} className="invite-card mx-auto flex w-full flex-col items-center">
            {wedding.invocation && (
              <div data-line className="flex flex-col items-center">
                <Kalasam className="h-[clamp(26px,2.4vw,34px)] w-auto" />
                <p className="ic-invocation mt-2">
                  <span aria-hidden className="ic-side-line" />
                  <span>{wedding.invocation}</span>
                  <span aria-hidden className="ic-side-line" />
                </p>
              </div>
            )}
            <GoldLabel className="mt-5">Dear</GoldLabel>
            <p data-line className="ic-guest mt-2.5">{isPersonalized ? guestName : "Family & Friends"}</p>
            <p data-line className="ic-lead mt-4">Some moments are too precious to celebrate without the people we love.</p>
            <p data-line className="ic-body mt-3">{wedding.invitationLine}</p>
            <h2 data-line id="invite-heading" className="ic-names">
              <span className="ic-name">{first.name}</span>
              <LotusMedallion>&amp;</LotusMedallion>
              <span className="ic-name">{second.name}</span>
            </h2>
            {wedding.blessing && <p data-line className="ic-blessing">{wedding.blessing}</p>}

            <LotusDivider className="ic-divider" />
            <GoldLabel>Counting the days</GoldLabel>
            <div className="mt-3.5 w-full">
              <Countdown iso={wedding.dateISO} />
            </div>
            <p data-line className="ic-until">
              until the Muhurtham · <b>{date.day} {date.month} {date.year}</b>
            </p>

            <LotusDivider className="ic-divider" />
            <GoldLabel>The Destination</GoldLabel>
            <p data-line className="ic-venue mt-2.5">{venue.name}</p>
            <p data-line className="ic-city mt-2">
              <Pin className="h-[1em] w-auto" />
              {wedding.city}
            </p>
            <a data-line href={mapsUrl(venue.mapsQuery)} target="_blank" rel="noopener noreferrer" className="ic-btn">
              Get Directions
            </a>

            <p data-line className="ic-await">We await your gracious presence</p>
            {wedding.families && (
              <p data-line className="ic-families mt-2.5">
                <span aria-hidden className="ic-families-line" />
                {wedding.families}
              </p>
            )}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
