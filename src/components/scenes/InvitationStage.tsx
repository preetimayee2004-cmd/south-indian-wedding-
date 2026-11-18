import { useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Ornament } from "@/components/ui/Ornament";
import { EventPanel } from "@/components/sections/events/EventPanel";
import { formatDay, formatTimeRange } from "@/lib/format";
import { TempleHeroScene } from "./TempleHeroScene";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** Matches the frame art's cream where carvings end. */
const CREAM = "radial-gradient(ellipse 60% 40% at 50% 30%, rgb(255 244 205 / 0.35), transparent 70%), linear-gradient(#f1d592, #f2d896 45%, #efd18c)";

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
 * Temple arch + "Dear Guest" invitation, then the celebrations one at a
 * time inside the same frame (dots show progress). Ends with the pillars
 * parting onto plain parchment, which lifts away (scalloped hem) to reveal
 * the couple scene underneath.
 */
export function ArchScene() {
  const { couple, wedding, venue, events, sections, media } = useWedding();
  const { guestName } = useGuest();
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const showEvents = events.length > 0 && sections.some((s) => s.id === "events" && s.enabled);

  const r = useRef<Record<string, HTMLElement | null>>({});
  const set = (k: string) => (el: HTMLElement | null) => void (r.current[k] = el);

  // Frame geometry (art px → screen): drawn a touch wider than the screen so
  // its outer sky strips fall outside (clip).
  const f = media.frame;
  const fw = `(100vw * ${(f.width / (f.width - 2 * f.clip)).toFixed(4)})`;
  const px = (n: number) => `calc(${fw} * ${(n / f.width).toFixed(5)})`;
  const cut = f.cut ?? { src: f.src, tile: f.tile?.src ?? f.src };
  const artBg = (pos: string): CSSProperties => ({ backgroundImage: `url("${cut.src.replace(/.webp$/, "@2x.webp")}")`, backgroundSize: "100% auto", backgroundRepeat: "no-repeat", backgroundPosition: pos });
  const tileH = f.tile?.height ?? 283;
  const pillar = (side: "left" | "right"): CSSProperties => ({
    position: "absolute",
    [side]: 0,
    top: px(f.top),
    bottom: px(f.bottom),
    width: px(f.side),
    backgroundImage: `url("${cut.tile.replace(/.webp$/, "@2x.webp")}")`,
    backgroundSize: `calc${fw} ${px(tileH)}`,
    backgroundPosition: `${side} top`,
    backgroundRepeat: "no-repeat round",
  });

  const build: Build = (tl) => {
    const $ = r.current;
    // the arch settles as it arrives, then the invitation is written in line by line
    tl.fromTo($.arch!, { scale: 0.94, yPercent: 3 }, { scale: 1, yPercent: 0, duration: 0.5, ease: "power2.out" }, 0);
    const lines = $.invite!.querySelectorAll("[data-line]");
    tl.from(lines, { autoAlpha: 0, y: 18, duration: 0.3, stagger: 0.14, ease: "power2.out" }, 0.3);
    let t = 0.3 + lines.length * 0.14 + 0.7;

    // ── The celebrations, one at a time
    if (showEvents) {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", $.events!);
      const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", $.events!);
      gsap.set(cards, { autoAlpha: 0, yPercent: 30 });
      gsap.set(dots, { opacity: 0.35, scale: 1 });
      tl.to($.invite!, { autoAlpha: 0, y: -40, duration: 0.45, ease: "power1.in" }, t).from(
        $.evHead!.children,
        { autoAlpha: 0, y: 16, duration: 0.35, stagger: 0.1, ease: "power2.out" },
        t + 0.3,
      );
      t += 0.7;
      cards.forEach((card, i) => {
        if (i > 0) {
          tl.to(cards[i - 1], { autoAlpha: 0, yPercent: -30, duration: 0.4, ease: "power1.in" }, t).to(dots[i - 1], { opacity: 0.35, scale: 1, duration: 0.3 }, t);
        }
        tl.to(card, { autoAlpha: 1, yPercent: 0, duration: 0.45, ease: "power2.out" }, t + (i > 0 ? 0.25 : 0)).to(
          dots[i],
          { opacity: 1, scale: 1.45, duration: 0.3 },
          t,
        );
        t += 1.1;
      });
    } else {
      t += 0.4;
    }

    // ── exit: the pillars part and the roof lifts, leaving plain parchment
    tl.to($.parch!, { autoAlpha: 1, duration: 0.4 }, t)
      .to($.pillarL!, { xPercent: -115, duration: 0.7, ease: "power2.in" }, t)
      .to($.pillarR!, { xPercent: 115, duration: 0.7, ease: "power2.in" }, t)
      .to($.roof!, { yPercent: -100, duration: 0.7, ease: "power2.in" }, t)
      .to($.base!, { yPercent: 100, duration: 0.7, ease: "power2.in" }, t)
      .to($.cream!, { autoAlpha: 0, duration: 0.5 }, t + 0.2)
      .to({}, { duration: 0.5 });
  };

  return (
    <Scene
      id="invitation"
      labelledBy="invite-heading"
      className="parchment"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#f5e8c9" }} />}
      edgeBottom={<div aria-hidden className="edge edge-scallop-bottom" style={{ ["--edge" as string]: "#efdfb9" }} />}
    >
      {/* plain parchment the frame leaves behind at the end */}
      <div ref={set("parch")} data-layer className="parchment invisible absolute inset-0 z-30 opacity-0" />

      {/* the temple arch, with the invitation and the events inside */}
      <div ref={set("arch")} data-layer className="absolute inset-0 z-40 origin-bottom">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2" style={{ width: `calc${fw}` }}>
          <div ref={set("cream")} className="absolute" style={{ left: px(f.side - 24), right: px(f.side - 24), top: px(f.top - 60), bottom: px(f.bottom), background: CREAM }} />
          <div ref={set("roof")} data-layer className="absolute inset-x-0 top-0" style={{ height: px(f.top), ...artBg("top center") }} />
          <div ref={set("pillarL")} data-layer style={pillar("left")} />
          <div ref={set("pillarR")} data-layer style={pillar("right")} />
          <div ref={set("base")} data-layer className="absolute inset-x-0 bottom-0" style={{ height: px(f.bottom), ...artBg("bottom center") }} />

          {/* writing area on the cream */}
          <div className="absolute" style={{ left: px(f.side + 6), right: px(f.side + 6), top: px(f.contentTop - 10), bottom: `calc(${px(f.bottom)} + 0.75rem)` }}>
            <div ref={set("invite")} className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {wedding.blessing && (
                <p data-line className="text-[0.72rem] tracking-[0.3em] text-ink">
                  {wedding.blessing}
                </p>
              )}
              <p data-line className="mt-2 font-script text-[clamp(1.7rem,min(8vw,4.4svh),2.6rem)] leading-none text-accent">
                Dear {guestName},
              </p>
              <p data-line className="mt-2 text-[clamp(0.9rem,min(4vw,2.3svh),1.1rem)] italic leading-snug text-ink">
                {wedding.invitationLine}
              </p>
              <h2 id="invite-heading" className="mt-2 font-script font-normal leading-[0.95] text-accent">
                <span data-line className="block text-[clamp(2.3rem,min(11vw,6svh),4rem)]">{first.name}</span>
                <span data-line className="block text-[clamp(1.3rem,min(6vw,3svh),2rem)] text-gold">&amp;</span>
                <span data-line className="block text-[clamp(2.3rem,min(11vw,6svh),4rem)]">{second.name}</span>
              </h2>
              <div data-line className="mt-3 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
                <span className="border-y border-gold/70 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink">{date.weekday}</span>
                <span className="text-[clamp(2.4rem,min(11vw,6svh),3.4rem)] leading-none text-accent">{date.day}</span>
                <span className="border-y border-gold/70 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink">
                  {date.month} {date.year}
                </span>
              </div>
              {wedding.muhurthamLabel && (
                <p data-line className="mt-2.5 text-[0.95rem] text-ink">
                  Muhurtham · {wedding.muhurthamLabel}
                </p>
              )}
              <p data-line className="mt-2 text-[0.74rem] font-bold uppercase tracking-[0.2em] text-ink">
                {venue.name}
              </p>
              <p data-line className="mt-0.5 text-[0.95rem] text-ink">
                {wedding.city}
              </p>
            </div>

            {showEvents && (
              <div ref={set("events")} className="absolute inset-0 flex flex-col items-center text-center">
                <div ref={set("evHead")} className="flex flex-col items-center">
                  <Ornament className="text-gold" />
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.28em] text-ink">You are invited to</p>
                  <h3 className="script-heading mt-1 text-[clamp(2rem,min(9vw,5svh),3rem)] leading-none">the celebrations</h3>
                  <div aria-hidden className="mt-3 flex gap-2.5">
                    {events.map((e) => (
                      <span key={e.id} data-dot className="block h-2 w-2 rounded-full bg-accent" />
                    ))}
                  </div>
                </div>
                <div className="relative mt-3 w-full flex-1">
                  {events.map((e, i) => (
                    <div key={e.id} data-card className="invisible absolute inset-x-0 top-0">
                      <EventPanel event={e} index={i} total={events.length} timeZone={wedding.timeZone} variant="flow" />
                    </div>
                  ))}
                </div>
                <ul className="sr-only">
                  {events.map((e) => (
                    <li key={e.id}>
                      {e.name}: {formatDay(e.startISO, wedding.timeZone)}, {formatTimeRange(e.startISO, wedding.timeZone, e.endISO)}
                      {e.venue ? `, ${e.venue}` : ""}. {e.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Scene>
  );
}
