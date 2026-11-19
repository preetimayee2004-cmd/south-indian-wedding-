import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Countdown } from "@/components/ui/Countdown";
import { mapsUrl } from "@/lib/format";
import { TempleHeroScene } from "./TempleHeroScene";
import { Flourish, GoldLabel, JasmineDivider, Kalasam, LotusMedallion, Pin } from "./invite/Ornaments";
import { petalBurst } from "./invite/petalBurst";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** The temple mandapam: tiled roof on two pillars over a carved plinth with steps in the middle
 *  (1192×742, cropped; its flat blue background keyed out and its colours matched to the hero
 *  with scripts/match-hero-colours.mjs, so the sky shows through). */
const ARCH = "/media/invite-arch.webp";
const ARCH_W = 1192;
const ARCH_H = 742;
const ARCH_RATIO = ARCH_W / ARCH_H;
/** The opening between the pillars, as fractions of the arch: where the cream sheet sits —
 *  from under the lintel down to the top of the steps. */
const PANEL = { top: 0.3935, bottom: 0.2008, side: 0.1284 };
/** The brass lamps, lotus bowls and steps that stand in front of the sheet's foot
 *  (cut from the same art: x 348–848, y 511–742 of 1192×742). */
const FRONT = { src: "/media/invite-arch-front.webp", left: 348 / ARCH_W, width: 500 / ARCH_W, ratio: "1000 / 462" };

/**
 * The invitation section: scene 1 (hero + temple) scrolls away upward, and the
 * temple arch follows right below it on the same sky (no overlap), easing up
 * into place as it arrives, holding the invitation and the celebrations.
 */
export function InvitationStage() {
  return (
    <>
      <TempleHeroScene tail={0} />
      <ArchScene />
    </>
  );
}

/** Rows of the arch (of ARCH_H): the roof, lintel and capitals end at SLICE_TOP, and the plain
 *  fluted stretch of the pillars that can be drawn taller runs to SLICE_END. */
const SLICE_TOP = 416;
const SLICE_END = 506;

/**
 * The painted temple arch with the invitation (as the reference's gate). It
 * follows the hero, easing up into place as it arrives, then simply scrolls with
 * the page — nothing is pinned, so nothing is ever cut off. The whole letter
 * sits on the cream sheet in the opening: when it needs more room than the
 * arch has, only the plain fluted stretch of the pillars is drawn taller (the
 * roof, capitals and bases keep their shape). Each line fades up as it comes
 * into view: "Dear …", the names, COUNTING THE DAYS (live), THE DESTINATION
 * with directions, and both families' sign-off.
 */
export function ArchScene() {
  const { couple, wedding, venue } = useWedding();
  const { guestName } = useGuest();
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
      $.panel!.style.setProperty("--sheet-h", `${Hn + extra - panelTop - panelBottom}px`);
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
        { y: () => window.innerHeight * 0.3 }, // it rises a little faster than the page
        { y: 0, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: SCRUB, invalidateOnRefresh: true } },
      );
      const boxes = gsap.utils.toArray<HTMLElement>("[data-box]", r.current.col);
      if (boxes.length)
        gsap.from(boxes, { y: 26, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: boxes[0], start: "top 94%", once: true } });
      const col = r.current.col!;
      const panel = r.current.panel!;
      // the flourishes under the names draw themselves (left → right) when the names appear
      const names = col.querySelector(".ic-names");
      gsap.fromTo(col.querySelectorAll(".ic-flourish [data-draw]"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.35, delay: 0.3, ease: "power2.inOut", scrollTrigger: { trigger: names, start: "top 90%", once: true } });
      // jasmine buds pop in one by one from the centre outward
      col.querySelectorAll<SVGElement>("[data-jasmine]").forEach((svg) => {
        const buds = [...svg.querySelectorAll<SVGGElement>("[data-bud] > .ic-bud")].sort((a, b) => Number(a.parentElement!.dataset.d) - Number(b.parentElement!.dataset.d));
        gsap.from(buds, { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.35, stagger: 0.07, ease: "back.out(2)", scrollTrigger: { trigger: svg, start: "top 92%", once: true } });
      });
      // the marigold strings grow down the zari borders as you read through the sheet
      gsap.fromTo(panel.querySelectorAll("[data-garland]"), { yPercent: -100 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: panel, start: "top 60%", end: "bottom bottom", scrub: SCRUB } });
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
      className="parchment-ground relative overflow-x-clip pb-10"
    >
      {/* the temple's stone floor ends here on a carved kerb, then parchment (90px+ before the finials) */}
      <div aria-hidden className="ground-kerb" />
      <div aria-hidden className="h-[96px]" />
      {/* the mandapam: full width, and at least 31.75rem so the sheet in its opening keeps the
          countdown in one row (on phones the pillars sit just past the screen edges) */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "max(31.75rem, 100vw)" }}>
      <div ref={set("box")} data-layer className="relative w-full" aria-label="A painted temple mandapam: a red tiled roof with goddess niches and golden finials on two teal pillars, over a carved plinth with steps, brass lamps and lotus bowls">
        <div ref={set("top")} className="absolute inset-x-0 top-0" style={{ backgroundImage: art, backgroundSize: "100% auto", backgroundPosition: "center top", backgroundRepeat: "no-repeat" }} />
        <div ref={set("mid")} className="absolute inset-x-0" style={{ backgroundImage: art, backgroundRepeat: "no-repeat" }} />
        <div ref={set("bot")} className="absolute inset-x-0 bottom-0" style={{ backgroundImage: art, backgroundSize: "100% auto", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat" }} />

        {/* the cream sheet in the opening between the pillars */}
        <div
          ref={set("panel")}
          className="ic-sheet absolute flex flex-col justify-center overflow-hidden border border-[#d9b25f]/80 text-ink shadow-[0_12px_40px_rgb(5_15_45/0.45)]"
          style={{ left: `${PANEL.side * 100}%`, right: `${PANEL.side * 100}%` }}
        >
          {/* Kanchipuram silk: the arch-shaped gold double line and dots, the zari borders with
              marigold strings that grow as you read, the pallu, and a few drifting petals */}
          <span aria-hidden className="ic-sheet-top" />
          <span aria-hidden className="ic-sheet-dots" />
          {["l", "r"].map((side) => (
            <span key={side} aria-hidden className={`ic-zari ic-zari--${side}`}>
              <span className="ic-garland-clip">
                <span data-garland className="ic-garland" />
              </span>
            </span>
          ))}
          <span aria-hidden className="ic-pallu" />
          <span aria-hidden className="ic-drift">
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} style={{ left: `${12 + ((i * 37) % 76)}%`, animationDelay: `${-i * 4.3}s`, animationDuration: `${22 + (i % 3) * 5}s` }} />
            ))}
          </span>
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
            <p data-line className="ic-guest mt-2.5" data-fit=".invite-card">{guestName}</p>
            <p data-line className="ic-lead mt-4">Some moments are too precious to celebrate without the people we love.</p>
            <p data-line className="ic-body mt-3">{wedding.invitationLine}</p>
            <div className="ic-names-wrap">
              <h2 data-line id="invite-heading" className="ic-names">
                <span className="ic-name-row">
                  <span className="ic-name" data-fit=".invite-card" data-text={first.name} onClick={(e) => petalBurst(e)}>
                    {first.name}
                  </span>
                  <Flourish />
                </span>
                <LotusMedallion>&amp;</LotusMedallion>
                <span className="ic-name-row">
                  <span className="ic-name" data-fit=".invite-card" data-text={second.name} onClick={(e) => petalBurst(e)}>
                    {second.name}
                  </span>
                  <Flourish />
                </span>
              </h2>
            </div>
            {wedding.blessing && <p data-line className="ic-blessing">{wedding.blessing}</p>}

            <JasmineDivider className="ic-divider" />
            <GoldLabel>Counting the days</GoldLabel>
            <div className="mt-3.5 w-full">
              <Countdown iso={wedding.dateISO} />
            </div>
            <p data-line className="ic-until">
              until the Muhurtham · <b>{date.day} {date.month} {date.year}</b>
            </p>

            <JasmineDivider className="ic-divider" />
            <GoldLabel>The Destination</GoldLabel>
            <p data-line className="ic-venue mt-2.5">
              <span>{venue.name}</span>
            </p>
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
        {/* the lamps, lotus bowls and steps stand in front of the sheet's foot */}
        <img
          aria-hidden
          src={FRONT.src}
          alt=""
          decoding="async"
          className="pointer-events-none absolute bottom-0 z-[2]"
          style={{ left: `${FRONT.left * 100}%`, width: `${FRONT.width * 100}%`, aspectRatio: FRONT.ratio }}
          draggable={false}
        />
      </div>
      </div>
    </section>
  );
}
