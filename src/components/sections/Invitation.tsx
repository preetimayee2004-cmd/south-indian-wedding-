import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { InvitationFrame } from "@/components/frame/InvitationFrame";
import { artProps } from "@/lib/art";

function useDateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/**
 * Section 01 — Invitation.
 * Hero: names, date and greeting over the gopuram and open sky; scrolling
 * zooms into the gopuram and dissolves into the whole temple with dancers.
 * A sharp gold line, then the invitation itself inside the temple frame.
 */
export function Invitation() {
  const { guestName } = useGuest();
  const { couple, wedding, media } = useWedding();
  const revealed = useRevealed();
  const reduced = usePrefersReducedMotion();
  const date = useDateParts(wedding.dateISO, wedding.timeZone);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const hero = useRef<HTMLDivElement>(null);
  const layerA = useRef<HTMLDivElement>(null);
  const imgA = useRef<HTMLImageElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);

  // Scroll: the hero holds while the gopuram zooms and rises into the exact
  // place it occupies in the second picture, which then dissolves in —
  // revealing the whole temple and the dancers.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: { trigger: hero.current, start: "top top", end: "+=130%", pin: true, scrub: 0.6, anticipatePin: 1 },
        })
        .to(copy.current, { yPercent: -35, autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0)
        .to([cue.current, veil.current], { autoAlpha: 0, duration: 0.15 }, 0)
        // gopuram top 54%→13%, base 93%→63% of the frame (matches the second art)
        .to(layerA.current, { scale: 1.28, yPercent: -56, duration: 0.6, ease: "power2.inOut" }, 0)
        // the dancers picture waits underneath, aligned; the gopuram picture lifts away
        .to(layerA.current, { autoAlpha: 0, duration: 0.3, ease: "none" }, 0.6)
        .to({}, { duration: 0.25 }); // rest on the dancers before moving on

    });
    return () => ctx.revert();
  }, [reduced]);

  // Entrance: once the opening hands over, the words settle onto the sky.
  useLayoutEffect(() => {
    if (reduced) return;
    const lines = copy.current!.children;
    if (!revealed) {
      gsap.set(lines, { autoAlpha: 0, y: 22 });
      gsap.set(imgA.current, { scale: 1.08 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(imgA.current, { scale: 1, duration: 2.4, ease: "power2.out" }, 0).to(
      lines,
      { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.14 },
      0.25,
    );
    return () => {
      tl.kill();
    };
  }, [revealed, reduced]);

  const dateLine = `${date.day} ${date.month} ${date.year}`;

  return (
    <section id="invitation" aria-labelledby="couple-names" className="relative isolate">
      {/* ── Hero ── */}
      <div ref={hero} className="relative overflow-hidden bg-[#5f9fdc]" style={{ height: "max(100svh, 640px)" }}>
        {/* Underneath: the whole temple with dancers, aligned to the gopuram above */}
        <div ref={layerB} className="absolute inset-0">
          <img {...artProps(media.heroReveal)} alt="The whole temple, with dancers performing in the courtyard" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div ref={layerA} className="absolute inset-0 origin-top" style={{ maskImage: "linear-gradient(to bottom, #000 94%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 94%, transparent)" }}>
          <img
            ref={imgA}
            {...artProps(media.invitation)}
            alt="A carved gopuram rising into a clear blue sky"
            fetchPriority="high"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
        {/* Gentle sky veil for text contrast; never covers the gopuram */}
        <div ref={veil} className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[rgb(28_62_112/0.32)] to-transparent" />

        <div
          ref={copy}
          className="relative z-10 flex flex-col items-center px-gutter text-center text-white [text-shadow:0_2px_16px_rgb(24_52_96/0.45)]"
          style={{ paddingTop: "max(3.75rem, 8svh)" }}
        >
          {wedding.blessing && <p className="text-[0.8rem] tracking-[0.32em]">{wedding.blessing}</p>}
          <p className="mt-3 font-script text-[clamp(1.9rem,min(8.5vw,5svh),2.8rem)] leading-tight">Dear {guestName},</p>
          <p className="mt-1.5 max-w-[19rem] text-[1rem] italic leading-snug opacity-95">{wedding.invitationLine}</p>
          <h1 id="couple-names" className="mt-3 font-script font-normal leading-[0.95]">
            <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{first.name}</span>
            <span className="block text-[clamp(1.5rem,min(6.5vw,4svh),2.6rem)] opacity-90">&amp;</span>
            <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{second.name}</span>
          </h1>
          <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.3em]">
            {dateLine} · {wedding.city.split(",")[0]}
          </p>
        </div>

        <ScrollCue ref={cue} href="#invitation-frame" className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2" />
      </div>

      {/* sharp edge under the dancers, then the temple frame */}
      <div className="section-rule" aria-hidden />
      <InvitationFrame />
    </section>
  );
}
