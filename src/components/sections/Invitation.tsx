import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { Ornament } from "@/components/ui/Ornament";
import { EdgeFade } from "@/components/ui/EdgeFade";
import { Countdown } from "./invitation/Countdown";

function useDateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/**
 * Section 01 — Invitation.
 * Hero: the gopuram under open sky, with the guest's personal greeting leading
 * and the couple's names as the page's h1. The sky layer drifts slower than the
 * page (parallax) while the words lift away.
 * Below: save-the-date, muhurtham, venue, quote and the live countdown.
 */
export function Invitation() {
  const { guestName } = useGuest();
  const { couple, wedding, venue, media } = useWedding();
  const revealed = useRevealed();
  const reduced = usePrefersReducedMotion();
  const date = useDateParts(wedding.dateISO, wedding.timeZone);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const hero = useRef<HTMLDivElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);

  // Scroll motion: parallax sky + lifting words + staggered detail reveals.
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.to(bg.current, {
        yPercent: 14,
        ease: "none",
        scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(copy.current, {
        y: -90,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: hero.current, start: "top top", end: "70% top", scrub: true },
      });

      const items = details.current!.querySelectorAll("[data-reveal]");
      gsap.set(items, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.12 }),
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  // Entrance: once the opening hands over, the greeting and names settle in.
  useLayoutEffect(() => {
    if (reduced) return;
    const lines = copy.current!.children;
    if (!revealed) {
      gsap.set(lines, { autoAlpha: 0, y: 22 });
      gsap.set(bg.current, { scale: 1.08 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(bg.current, { scale: 1, duration: 2.4, ease: "power2.out" }, 0).to(
      lines,
      { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.14 },
      0.25,
    );
    return () => {
      tl.kill();
    };
  }, [revealed, reduced]);

  return (
    <section id="invitation" aria-labelledby="couple-names" className="relative isolate">
      {/* ── Hero ── */}
      <div ref={hero} className="relative overflow-hidden bg-[#5f9fdc]" style={{ minHeight: "max(100svh, 640px)" }}>
        <EdgeFade bottom size="3.5rem" />
        <div ref={bg} className="absolute inset-x-0 -top-[12%] bottom-0">
          {/* Wide screens: soft blurred fill behind the portrait art */}
          <img src={media.invitation} alt="" aria-hidden className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-2xl md:block" />
          <img
            src={media.invitation}
            alt="A carved gopuram rising into a clear blue sky"
            fetchPriority="high"
            className="relative mx-auto h-full w-full object-cover object-bottom md:w-auto md:object-contain"
            draggable={false}
          />
        </div>
        {/* Gentle sky veil for text contrast; never covers the gopuram */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-[rgb(28_62_112/0.32)] to-transparent" />

        <div
          ref={copy}
          className="relative z-10 flex flex-col items-center px-gutter text-center text-white [text-shadow:0_2px_16px_rgb(24_52_96/0.45)]"
          style={{ paddingTop: "max(4.25rem, 10svh)" }}
        >
          {wedding.blessing && <p className="text-[0.8rem] tracking-[0.32em]">{wedding.blessing}</p>}
          <p className="mt-4 font-script text-[clamp(2rem,min(9vw,5.5svh),3rem)] leading-tight">Dear {guestName},</p>
          <p className="mt-2 max-w-[19rem] text-[1.02rem] italic leading-snug opacity-95 md:max-w-[26rem] md:text-lg">
            {wedding.invitationLine}
          </p>
          <h1 id="couple-names" className="mt-4 font-script font-normal leading-[0.95]">
            <span className="block text-[clamp(3.2rem,min(15vw,10svh),7rem)]">{first.name}</span>
            <span className="block text-[clamp(1.6rem,min(7vw,4.5svh),3rem)] opacity-90">&amp;</span>
            <span className="block text-[clamp(3.2rem,min(15vw,10svh),7rem)]">{second.name}</span>
          </h1>
        </div>

        <a
          href="#invitation-details"
          className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full bg-paper/85 px-4 pb-3 pt-2 text-ink-soft backdrop-blur-sm"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.3em]">Scroll</span>
          <span className="block h-5 w-px overflow-hidden bg-line">
            <span className="block h-full w-full animate-[cue_2.2s_ease-in-out_infinite] bg-accent motion-reduce:animate-none" />
          </span>
          <span className="sr-only">to the wedding details</span>
        </a>
      </div>

      {/* ── Details ── */}
      <div id="invitation-details" ref={details} className="relative py-section">
        <Container className="flex flex-col items-center text-center">
          <p data-reveal className="eyebrow">Save the date</p>

          <div data-reveal className="mt-6 grid w-full max-w-[22rem] grid-cols-[1fr_auto_1fr] items-center gap-4 md:max-w-[28rem]">
            <span className="border-y border-gold/50 py-2 text-[0.8rem] uppercase tracking-[0.2em] text-ink-soft">{date.weekday}</span>
            <span className="text-[4.25rem] leading-none text-accent md:text-[5rem]">{date.day}</span>
            <span className="border-y border-gold/50 py-2 text-[0.8rem] uppercase tracking-[0.2em] text-ink-soft">
              {date.month} {date.year}
            </span>
          </div>

          {wedding.muhurthamLabel && (
            <p data-reveal className="mt-5 text-ink">
              <span className="text-ink-soft">Muhurtham</span> · {wedding.muhurthamLabel}
            </p>
          )}

          <div data-reveal className="mt-8">
            <Ornament className="text-gold" />
          </div>

          <div data-reveal className="mt-7">
            <p className="text-[0.85rem] uppercase tracking-[0.24em] text-ink">{venue.name}</p>
            <p className="mt-1 text-ink-soft">{wedding.city}</p>
          </div>

          {wedding.quote && (
            <p data-reveal className="mt-8 max-w-[20rem] text-xl italic leading-snug text-ink-soft md:max-w-[26rem] md:text-2xl">
              “{wedding.quote}”
            </p>
          )}

          <div data-reveal className="mt-12 w-full">
            <Countdown targetISO={wedding.dateISO} label="Counting down to the muhurtham" />
          </div>
        </Container>
      </div>
    </section>
  );
}
