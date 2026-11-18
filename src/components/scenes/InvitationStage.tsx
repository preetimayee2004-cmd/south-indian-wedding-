import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Countdown } from "@/components/ui/Countdown";
import { mapsUrl } from "@/lib/format";
import { bgImage } from "@/lib/art";
import { TempleHeroScene } from "./TempleHeroScene";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** The temple arch, drawn in the hero temple's style (751×754, cropped to the arch; its flat
 *  blue background cut away by scripts/cut-flat-bg.mjs, so the sky shows through). */
const ARCH = "/media/invite-arch.webp";
const ARCH_W = 751;
const ARCH_H = 754;
const ARCH_RATIO = ARCH_W / ARCH_H;
/** The opening between the pillars, as fractions of the arch: where the invitation panel sits. */
const PANEL = { top: 0.385, bottom: 0.13, side: 0.205 };

/**
 * The invitation section: scene 1 (hero + temple), then the temple arch rises
 * in beneath it as the temple moves up off the screen, and holds the
 * invitation and the celebrations.
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
const SLICE_TOP = 466;
const SLICE_END = 576;

/**
 * The painted temple arch with the invitation (as the reference's gate). It
 * rises in beneath the leaving hero and docks, then simply scrolls with
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
      const need = $.col!.offsetHeight + 56; // the letter + the sheet's padding
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
      gsap.utils.toArray<HTMLElement>("[data-line]", r.current.col).forEach((el) =>
        gsap.from(el, { opacity: 0, y: 18, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 94%", once: true } }),
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // lazy: the arch art starts loading only a screen before it comes up
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), io.disconnect()), { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const art = near ? bgImage(ARCH) : "none";

  return (
    <section
      ref={root}
      id="invitation"
      aria-labelledby="invite-heading"
      className="cobalt relative overflow-x-clip pb-10"
    >
      {/* the arch, a little wider than phones so the opening is roomy (pillars still in view); full width on large screens */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "max(min(118vw, 45rem), 100vw)" }}>
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
            background: "radial-gradient(ellipse 70% 30% at 50% 12%, rgb(255 250 232 / 0.6), transparent 70%), rgb(250 239 212 / 0.96)",
          }}
        >
          <div ref={set("col")} className="mx-auto flex max-w-[30rem] flex-col items-center px-3.5 pb-6 pt-8 text-center">
                {wedding.invocation && <p data-line className="text-[0.82rem] font-bold tracking-[0.24em] text-maroon">{wedding.invocation}</p>}
                <p data-line className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.42em] text-ink">Dear</p>
                <p data-line className="mt-1 font-script text-[clamp(2.1rem,min(9.5vw,5.2svh),3rem)] leading-[1.1] text-accent">“{isPersonalized ? guestName : "Family & Friends"}”</p>
                <p data-line className="mt-2.5 text-[clamp(1rem,min(4.3vw,2.45svh),1.2rem)] font-semibold italic leading-snug text-ink">
                  Some moments are too precious to celebrate without the people we love.
                </p>
                <p data-line className="mt-2 text-[clamp(0.95rem,min(4.1vw,2.35svh),1.15rem)] font-medium leading-snug text-ink">{wedding.invitationLine}</p>
                <h2 data-line id="invite-heading" className="mt-3 font-script font-normal leading-[1.08] text-accent">
                  <span className="block text-[clamp(2.5rem,min(11.5vw,6.3svh),4.2rem)]">{first.name}</span>
                  <span className="block text-[clamp(1.4rem,min(6vw,3.2svh),2.1rem)] leading-none text-gold">&amp;</span>
                  <span className="block text-[clamp(2.5rem,min(11.5vw,6.3svh),4.2rem)]">{second.name}</span>
                </h2>
                {wedding.blessing && <p data-line className="mt-2 text-[0.95rem] font-bold tracking-[0.26em] text-maroon">{wedding.blessing}</p>}

                <span data-line aria-hidden className="mt-4 block h-px w-28 bg-gold/80" />
                <p data-line className="mt-4 text-[0.8rem] font-bold uppercase tracking-[0.32em] text-maroon">Counting the days</p>
                <div data-line className="mt-2.5 w-full max-w-[19rem]">
                  <Countdown iso={wedding.dateISO} />
                </div>
                <p data-line className="mt-2.5 text-[0.95rem] font-semibold italic text-ink">
                  until the Muhurtham · {date.day} {date.month} {date.year}
                </p>

                <span data-line aria-hidden className="mt-5 block h-px w-28 bg-gold/80" />
                <p data-line className="mt-5 text-[0.8rem] font-bold uppercase tracking-[0.32em] text-maroon">The Destination</p>
                <p data-line className="mt-2 font-script text-[clamp(2.2rem,min(10vw,5.4svh),3.2rem)] leading-[1.05] text-accent">{venue.name}</p>
                <p data-line className="mt-1 text-[1.02rem] font-semibold text-ink">{wedding.city}</p>
                <a
                  data-line
                  href={mapsUrl(venue.mapsQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-maroon px-6 py-3 text-[0.76rem] font-bold uppercase tracking-[0.2em] text-[#fbf2dc] shadow-[0_6px_16px_rgb(122_46_42/0.3)]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                  Get Directions
                </a>

                <p data-line className="mt-6 font-script text-[clamp(1.9rem,min(8.2vw,4.6svh),2.6rem)] leading-tight text-accent">We await your gracious presence</p>
                {wedding.families && <p data-line className="mt-1 text-[1rem] font-semibold italic text-ink">— {wedding.families}</p>}
              </div>
        </div>
      </div>
      </div>
    </section>
  );
}
