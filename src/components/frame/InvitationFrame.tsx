import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useGuest } from "@/context/GuestContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Ornament } from "@/components/ui/Ornament";
import { EventPanel } from "@/components/sections/events/EventPanel";
import { GopuramFrame } from "./GopuramFrame";

function dateParts(iso: string, timeZone: string) {
  const d = new Date(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone, ...o }).format(d);
  return { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
}

/**
 * The invitation, written on the cream inside the temple frame, followed by
 * the celebrations — the pillars keep growing until the last event, then the
 * frame closes on its carved bases.
 */
export function InvitationFrame() {
  const { couple, wedding, venue, events, sections } = useWedding();
  const { guestName } = useGuest();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const date = dateParts(wedding.dateISO, wedding.timeZone);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const showEvents = events.length > 0 && sections.some((s) => s.id === "events" && s.enabled);

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <GopuramFrame id="invitation-frame" labelledBy="invite-heading">
      <div ref={root} className="mx-auto max-w-[40rem] text-center">
        {wedding.blessing && (
          <p data-reveal className="text-[0.78rem] tracking-[0.32em] text-ink-soft md:text-[0.9rem]">
            {wedding.blessing}
          </p>
        )}
        <p data-reveal className="mt-3 font-script text-[clamp(1.9rem,3.2vw,3rem)] leading-none text-accent">
          Dear {guestName},
        </p>
        <p data-reveal className="mx-auto mt-3 max-w-[30rem] text-[1.02rem] italic leading-snug text-ink md:text-[1.2rem]">
          {wedding.invitationLine}
        </p>
        <h2 id="invite-heading" data-reveal className="mt-4 font-script font-normal leading-[0.95] text-accent">
          <span className="block text-[clamp(2.8rem,5.4vw,5.4rem)]">{first.name}</span>
          <span className="block text-[clamp(1.5rem,2.6vw,2.6rem)] text-gold">&amp;</span>
          <span className="block text-[clamp(2.8rem,5.4vw,5.4rem)]">{second.name}</span>
        </h2>

        <div data-reveal className="mx-auto mt-6 grid max-w-[24rem] grid-cols-[1fr_auto_1fr] items-center gap-3 md:max-w-[30rem] md:gap-6">
          <span className="border-y border-gold/60 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft md:text-[0.82rem]">{date.weekday}</span>
          <span className="text-[3.4rem] leading-none text-accent md:text-[4.5rem]">{date.day}</span>
          <span className="border-y border-gold/60 py-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft md:text-[0.82rem]">
            {date.month} {date.year}
          </span>
        </div>
        {wedding.muhurthamLabel && (
          <p data-reveal className="mt-4 text-ink">
            <span className="text-ink-soft">Muhurtham</span> · {wedding.muhurthamLabel}
          </p>
        )}
        <p data-reveal className="mt-5 text-[0.8rem] font-bold uppercase tracking-[0.22em] text-ink md:text-[0.9rem]">
          {venue.name}
        </p>
        <p data-reveal className="mt-1 text-ink-soft">{wedding.city}</p>

        {showEvents && (
          <>
            <div data-reveal className="mt-10 flex justify-center">
              <Ornament className="text-gold" />
            </div>
            <p data-reveal className="mt-6 text-eyebrow uppercase text-ink-soft">
              You are invited to
            </p>
            <h3 data-reveal className="script-heading mt-1 text-[clamp(2.2rem,4vw,3.6rem)] leading-none">
              the celebrations
            </h3>
            <div className="mt-10 flex flex-col items-center gap-10">
              {events.map((e, i) => (
                <div key={e.id} data-reveal className="flex w-full flex-col items-center gap-10">
                  {i > 0 && <span aria-hidden className="h-px w-24 bg-gold/60" />}
                  <EventPanel event={e} index={i} total={events.length} timeZone={wedding.timeZone} variant="flow" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </GopuramFrame>
  );
}
