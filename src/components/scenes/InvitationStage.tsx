import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Layer } from "@/components/scene/Layer";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { Ornament } from "@/components/ui/Ornament";
import { EventPanel } from "@/components/sections/events/EventPanel";
import { formatDay, formatTimeRange } from "@/lib/format";
import { layer } from "@/lib/art";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/** Matches the frame art's cream where carvings end. */
const CREAM = "radial-gradient(ellipse 60% 40% at 50% 30%, rgb(255 244 205 / 0.35), transparent 70%), linear-gradient(#f1d592, #f2d896 45%, #efd18c)";

/**
 * Scenes 1–5 on phones, in ONE pinned stage so the camera never cuts:
 *  1 Hero      clouds drift, names rise at half speed and fade, gopuram rises
 *  2 Gopuram   the gopuram scales 1→1.6 about its doorway; sky almost still
 *  3 Dancers   seen through the doorway, which opens to the full screen
 *  4 Arch      the painted temple arch rises over the dancers and settles as
 *              the frame; the invitation is written in line by line
 *  5 Events    inside the same frame, one celebration at a time + dots
 * Ends with the pillars parting onto plain parchment, which then lifts away
 * (scalloped hem) to reveal the couple scene underneath.
 */
export function InvitationStage() {
  const { couple, wedding, venue, events, sections, media } = useWedding();
  const { guestName } = useGuest();
  const revealed = useRevealed();
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const showEvents = events.length > 0 && sections.some((s) => s.id === "events" && s.enabled);

  // Layers (exported art when present, else the flat painting)
  const hero = { sky: layer("hero-sky"), clouds: layer("hero-clouds"), gopuram: layer("hero-gopuram") };
  const flatHero = !hero.sky || !hero.gopuram;
  const dz = {
    sky: layer("dancers-sky"),
    clouds: layer("dancers-clouds"),
    courtyard: layer("dancers-courtyard"),
    dancers: layer("dancers-dancers"),
    kolam: layer("dancers-kolam"),
  };

  const copy = useRef<HTMLDivElement>(null);
  const r = useRef<Record<string, HTMLElement | null>>({});
  const set = (k: string) => (el: HTMLElement | null) => void (r.current[k] = el);

  // Entrance once the envelope hands over: the words settle onto the sky.
  useLayoutEffect(() => {
    const lines = copy.current?.children;
    if (!lines) return;
    if (!revealed) {
      gsap.set(lines, { autoAlpha: 0, y: 22 });
      return;
    }
    const tl = gsap.to(lines, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.14, delay: 0.2 });
    return () => void tl.kill();
  }, [revealed]);

  // Frame geometry (art px → screen): the frame is drawn a touch wider than
  // the screen so its outer sky strips fall outside (clip).
  const f = media.frame;
  const fw = `(100vw * ${(f.width / (f.width - 2 * f.clip)).toFixed(4)})`;
  const px = (n: number) => `calc(${fw} * ${(n / f.width).toFixed(5)})`;
  const cut = f.cut ?? { src: f.src, tile: f.tile?.src ?? f.src };
  const artBg = (pos: string): CSSProperties => ({ backgroundImage: `url("${cut.src.replace(/\.webp$/, "@2x.webp")}")`, backgroundSize: "100% auto", backgroundRepeat: "no-repeat", backgroundPosition: pos });
  const tileH = f.tile?.height ?? 283;
  const pillar = (side: "left" | "right"): CSSProperties => ({
    position: "absolute",
    [side]: 0,
    top: px(f.top),
    bottom: px(f.bottom),
    width: px(f.side),
    backgroundImage: `url("${cut.tile.replace(/\.webp$/, "@2x.webp")}")`,
    backgroundSize: `calc${fw} ${px(tileH)}`,
    backgroundPosition: `${side} top`,
    backgroundRepeat: "no-repeat round",
  });

  const build: Build = (tl) => {
    const $ = r.current;
    const H = () => window.innerHeight;

    // ── 1 · Hero (0 → 1.4)
    tl.to(copy.current, { y: () => -0.5 * 1.4 * H(), autoAlpha: 0, duration: 1.4 }, 0) // half the scroll speed
      .to($.cue!, { autoAlpha: 0, duration: 0.15 }, 0)
      .to($.veil!, { autoAlpha: 0, duration: 0.6 }, 0.4);
    if ($.clouds) tl.to($.clouds, { xPercent: 7, duration: 3.4 }, 0);
    if (flatHero) {
      tl.fromTo($.sky!, { yPercent: 0 }, { yPercent: -10, duration: 1.4, ease: "power1.out" }, 0);
    } else {
      tl.to($.sky!, { yPercent: -2, duration: 1.4 }, 0).fromTo(
        $.gopuram!,
        { yPercent: 30 },
        { yPercent: 0, duration: 1.4, ease: "power1.out" },
        0,
      );
    }

    // ── 2 · Gopuram: the camera travels to the entrance (1.4 → 3.2)
    const doorY = `${media.openingDoorY * 100}%`;
    const zoom = flatHero ? $.sky! : $.gopuram!;
    tl.set(zoom, { transformOrigin: `50% ${doorY}` }, 0)
      .to(zoom, { scale: 1.6, duration: 1.8, ease: "power2.in" }, 1.4)
      .to(flatHero ? {} : $.sky!, { scale: 1.04, duration: 1.8 }, 1.4);
    if ($.clouds) tl.to($.clouds, { scale: 1.1, duration: 1.8 }, 1.4);

    // ── 3 · Through the doorway: an arch-shaped window opens to full screen.
    // The window scales up while its contents scale down by the same amount,
    // so the dancers stay put and only the opening grows (transforms only).
    const door = { s: 0.06 };
    const apply = () => {
      gsap.set($.door!, { scale: door.s });
      gsap.set($.doorInner!, { scale: 1 / door.s });
    };
    apply();
    gsap.set($.door!, { autoAlpha: 0 });
    tl.set($.door!, { autoAlpha: 1 }, 2.75).to(door, { s: 1, duration: 1.1, ease: "power2.in", onUpdate: apply }, 2.75);

    // dancers: courtyard slow, dancers a little faster, kolam floor fastest (3.4 → 5.4)
    tl.to($.dSky!, { yPercent: -1.5, duration: 2 }, 3.4);
    if ($.dClouds) tl.to($.dClouds, { xPercent: -5, duration: 2.6 }, 3.2);
    tl.to($.dCourt!, { yPercent: -3, duration: 2 }, 3.4);
    if ($.dDancers) tl.to($.dDancers, { yPercent: -5, duration: 2 }, 3.4);
    if ($.dKolam) tl.to($.dKolam, { yPercent: -6.5, duration: 2 }, 3.4);

    // ── 4 · The arch rises over the dancers, then scales up into the frame (4.6 → 6.4)
    tl.fromTo($.arch!, { yPercent: 108, scale: 0.7 }, { yPercent: 10, duration: 1, ease: "power2.out" }, 4.6).to(
      $.arch!,
      { yPercent: 0, scale: 1, duration: 0.8, ease: "power2.inOut" },
      5.6,
    );
    const lines = $.invite!.querySelectorAll("[data-line]");
    tl.from(lines, { autoAlpha: 0, y: 18, duration: 0.3, stagger: 0.14, ease: "power2.out" }, 6.3);
    let t = 6.3 + lines.length * 0.14 + 0.7;

    // ── 5 · The celebrations, one at a time
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

  const dateLine = `${date.day} ${date.month} ${date.year}`;
  const layerBox = "absolute inset-0";

  return (
    <Scene
      id="invitation"
      labelledBy="couple-names"
      className="bg-[#5f9fdc]"
      build={build}
      edgeBottom={<div aria-hidden className="edge edge-scallop-bottom" style={{ ["--edge" as string]: "#efdfb9" }} />}
    >
      {/* ── 1/2 · Sky, clouds, gopuram ── */}
      {flatHero ? (
        <Layer ref={set("sky")} src={media.invitation} alt="A carved gopuram rising into a clear blue sky" className="absolute inset-x-0 top-0 h-[112%]" hi eager />
      ) : (
        <>
          <Layer ref={set("sky")} src={hero.sky!} className={layerBox} eager />
          {hero.clouds && <Layer ref={set("clouds")} src={hero.clouds} className={layerBox} eager />}
          <Layer ref={set("gopuram")} src={hero.gopuram!} alt="A carved gopuram rising into a clear blue sky" className={layerBox} hi eager />
        </>
      )}
      <div ref={set("veil")} className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[rgb(28_62_112/0.32)] to-transparent" />

      <div
        ref={copy}
        data-layer
        className="relative z-10 flex flex-col items-center px-gutter text-center text-white [text-shadow:0_2px_16px_rgb(24_52_96/0.5)]"
        style={{ paddingTop: "max(3.75rem, 8svh)" }}
      >
        {wedding.blessing && <p className="text-[0.8rem] tracking-[0.32em]">{wedding.blessing}</p>}
        <p className="mt-3 font-script text-[clamp(1.9rem,min(8.5vw,5svh),2.8rem)] leading-tight">Dear {guestName},</p>
        <p className="mt-1.5 max-w-[19rem] text-[1rem] italic leading-snug">{wedding.invitationLine}</p>
        <h1 id="couple-names" className="mt-3 font-script font-normal leading-[0.95]">
          <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{first.name}</span>
          <span className="block text-[clamp(1.5rem,min(6.5vw,4svh),2.6rem)]">&amp;</span>
          <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{second.name}</span>
        </h1>
        <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.3em]">
          {dateLine} · {wedding.city.split(",")[0]}
        </p>
      </div>
      <ScrollCue ref={set("cue") as never} href="#invite-heading" className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2" />

      {/* ── 3 · Doorway window onto the dancers ── */}
      <div
        ref={set("door")}
        data-layer
        className="absolute bottom-0 left-[-20vw] z-20 h-[125svh] w-[140vw] origin-bottom overflow-hidden"
        style={{ borderRadius: "50% 50% 0 0 / 28% 28% 0 0" }}
      >
        <div ref={set("doorInner")} data-layer className="absolute bottom-0 left-[20vw] h-[100svh] w-[100vw] origin-bottom bg-[#7fb6e6]">
          {dz.courtyard ? (
            <>
              <Layer ref={set("dSky")} src={dz.sky ?? dz.courtyard} className="absolute inset-x-0 -top-[3%] h-[108%]" />
              {dz.clouds && <Layer ref={set("dClouds")} src={dz.clouds} className="absolute inset-x-0 -top-[3%] h-[108%]" />}
              <Layer ref={set("dCourt")} src={dz.courtyard} alt="The whole temple, with dancers performing in the courtyard" className="absolute inset-x-0 -top-[3%] h-[108%]" />
              {dz.dancers && <Layer ref={set("dDancers")} src={dz.dancers} className="absolute inset-x-0 -top-[3%] h-[108%]" />}
              {dz.kolam && <Layer ref={set("dKolam")} src={dz.kolam} className="absolute inset-x-0 -top-[3%] h-[108%]" />}
            </>
          ) : (
            <>
              <div ref={set("dSky")} />
              <Layer ref={set("dCourt")} src={media.heroReveal} alt="The whole temple, with dancers performing in the courtyard" className="absolute inset-x-0 -top-[3%] h-[108%]" />
            </>
          )}
        </div>
      </div>

      {/* plain parchment the frame leaves behind at the end */}
      <div ref={set("parch")} data-layer className="parchment invisible absolute inset-0 z-30 opacity-0" />

      {/* ── 4/5 · The temple arch, with the invitation and the events inside ── */}
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
