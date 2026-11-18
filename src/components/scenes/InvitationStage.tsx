import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Countdown } from "@/components/ui/Countdown";
import { mapsUrl } from "@/lib/format";
import { TempleHeroScene } from "./TempleHeroScene";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** The painted temple arch (portrait 896×1200, with its own starry night sky). */
const ARCH = "/media/invite-arch.webp";
const ARCH_RATIO = 896 / 1200;
/** The opening between the pillars, as fractions of the arch: where the invitation panel sits. */
const PANEL = { top: 0.278, bottom: 0.07, side: 0.258 };
/** The arch's sky, continued at the sides on wide screens. */
export const ARCH_SKY = "linear-gradient(#0c306d, #1d3f80 45%, #16316e)";

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

/**
 * The painted temple arch rises over the hero (scalloped edge) and settles.
 * It always spans the full screen width (and at least its height); where it
 * is taller than the screen the camera travels down it, from the roof to the
 * pillar bases. Inside its opening, on a cream panel under the starry sky, the
 * whole invitation is on the sheet from the moment the arch arrives (as in the
 * reference patrika): "Dear …", the names, COUNTING THE DAYS (live), then THE
 * DESTINATION with directions, signed by both families — whatever doesn't fit
 * on screen drifts up into view as you scroll. The celebrations follow next.
 */
export function ArchScene() {
  const { couple, wedding, venue } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const r = useRef<Record<string, HTMLElement | null>>({});
  const set = (k: string) => (el: HTMLElement | null) => void (r.current[k] = el);

  const build: Build = (tl) => {
    const $ = r.current;
    const vh = window.innerHeight;
    const H = $.box!.offsetHeight; // the arch at full width (or full height)
    const travel = Math.max(0, H - vh);
    // where the arch is taller than the screen, it enters with the top of the
    // panel just under the screen top — so the letter is readable from the start —
    // and the camera then travels on down to the bases while the letter stays put
    const y0 = -Math.min(travel, Math.max(0, PANEL.top * H - 0.06 * vh));
    const ride = -travel - y0; // the rest of the camera move (≤ 0)
    gsap.set($.box!, { y: y0 });

    // the arch settles as it arrives; the letter is on the sheet from the start
    tl.fromTo($.arch!, { scale: 0.97, yPercent: 2 }, { scale: 1, yPercent: 0, duration: 0.4, ease: "power2.out" }, 0);
    const move = -ride / vh;
    if (move > 0) {
      tl.to($.box!, { y: -travel, duration: move, ease: "none" }, 0.2).fromTo($.write!, { y: 0 }, { y: -ride, duration: move, ease: "none" }, 0.2);
    }
    // what doesn't fit on screen (the destination, the families) drifts up into view
    const writeTop = $.write!.getBoundingClientRect().top - $.box!.getBoundingClientRect().top + y0; // on screen at the start
    const room = Math.min($.write!.clientHeight, vh - writeTop - 16);
    const over = Math.max(0, $.col!.scrollHeight - room);
    if (over > 0) tl.to($.col!, { y: -over, duration: Math.max(0.7, (over / vh) * 1.5), ease: "none" }, 0.45);
    tl.to({}, { duration: 0.6 });
  };

  return (
    <Scene
      id="invitation"
      labelledBy="invite-heading"
      style={{ background: ARCH_SKY }}
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#0c306d" }} />}
    >
      {/* the arch: as tall as the screen, centred; on wide screens its sky continues at the sides */}
      <div ref={set("arch")} data-layer className="absolute inset-0 origin-bottom">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div ref={set("box")} data-layer className="relative" style={{ width: `max(100vw, calc(100svh * ${ARCH_RATIO.toFixed(4)}))`, aspectRatio: `${ARCH_RATIO}` }}>
          <img src={ARCH.replace(/.webp$/, "@2x.webp")} alt="A carved temple arch under a starry blue sky with falling petals" decoding="async" className="block h-full w-full object-cover" draggable={false} />

          {/* the invitation panel, in the opening between the pillars */}
          <div
            ref={set("panel")}
            className="absolute overflow-hidden border border-[#d9b25f]/80 text-ink shadow-[0_12px_40px_rgb(5_15_45/0.45)]"
            style={{
              top: `${PANEL.top * 100}%`,
              bottom: `${PANEL.bottom * 100}%`,
              left: `${PANEL.side * 100}%`,
              right: `${PANEL.side * 100}%`,
              borderRadius: "48% 48% 8px 8px / 9% 9% 8px 8px",
              background: "radial-gradient(ellipse 70% 40% at 50% 20%, rgb(255 250 232 / 0.6), transparent 70%), rgb(250 239 212 / 0.95)",
            }}
          >
            <div ref={set("write")} data-layer className="absolute inset-x-2.5 bottom-3 top-5">
            <div className="absolute inset-0 overflow-hidden">
              <div ref={set("col")} data-layer className="mx-auto flex max-w-[30rem] flex-col items-center px-1 pb-8 text-center">
                {wedding.invocation && <p className="text-[0.82rem] font-bold tracking-[0.24em] text-maroon">{wedding.invocation}</p>}
                <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.42em] text-ink">Dear</p>
                <p className="mt-1 font-script text-[clamp(2.1rem,min(9.5vw,5.2svh),3rem)] leading-[1.1] text-accent">“{isPersonalized ? guestName : "Family & Friends"}”</p>
                <p className="mt-2.5 text-[clamp(1rem,min(4.3vw,2.45svh),1.2rem)] font-semibold italic leading-snug text-ink">
                  Some moments are too precious to celebrate without the people we love.
                </p>
                <p className="mt-2 text-[clamp(0.95rem,min(4.1vw,2.35svh),1.15rem)] font-medium leading-snug text-ink">{wedding.invitationLine}</p>
                <h2 id="invite-heading" className="mt-3 font-script font-normal leading-[1.08] text-accent">
                  <span className="block text-[clamp(2.5rem,min(11.5vw,6.3svh),4.2rem)]">{first.name}</span>
                  <span className="block text-[clamp(1.4rem,min(6vw,3.2svh),2.1rem)] leading-none text-gold">&amp;</span>
                  <span className="block text-[clamp(2.5rem,min(11.5vw,6.3svh),4.2rem)]">{second.name}</span>
                </h2>
                {wedding.blessing && <p className="mt-2 text-[0.95rem] font-bold tracking-[0.26em] text-maroon">{wedding.blessing}</p>}

                <span aria-hidden className="mt-4 block h-px w-28 bg-gold/80" />
                <p className="mt-4 text-[0.8rem] font-bold uppercase tracking-[0.32em] text-maroon">Counting the days</p>
                <div className="mt-2.5 w-full max-w-[19rem]">
                  <Countdown iso={wedding.dateISO} />
                </div>
                <p className="mt-2.5 text-[0.95rem] font-semibold italic text-ink">
                  until the Muhurtham · {date.day} {date.month} {date.year}
                </p>

                <span aria-hidden className="mt-5 block h-px w-28 bg-gold/80" />
                <p className="mt-5 text-[0.8rem] font-bold uppercase tracking-[0.32em] text-maroon">The Destination</p>
                <p className="mt-2 font-script text-[clamp(2.2rem,min(10vw,5.4svh),3.2rem)] leading-[1.05] text-accent">{venue.name}</p>
                <p className="mt-1 text-[1.02rem] font-semibold text-ink">{wedding.city}</p>
                <a
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

                <p className="mt-6 font-script text-[clamp(1.9rem,min(8.2vw,4.6svh),2.6rem)] leading-tight text-accent">We await your gracious presence</p>
                {wedding.families && <p className="mt-1 text-[1rem] font-semibold italic text-ink">— {wedding.families}</p>}
              </div>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Scene>
  );
}
