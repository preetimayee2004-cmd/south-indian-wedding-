import { useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useAudio } from "@/context/AudioContext";
import { useSfxOnView } from "@/hooks/useSfxOnView";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TempleDress } from "@/components/ui/TempleDress";
import { calendarUrl } from "@/lib/format";
import { gsap } from "@/lib/gsap";

/** Link to share: the page without personal params, so a forwarded link never carries this guest's name. */
function shareableUrl(dropParams: string[]): string {
  const u = new URL(window.location.href);
  [...dropParams, "nointro", "tokens", "wishdemo", "rsvpform"].forEach((p) => u.searchParams.delete(p));
  u.hash = "";
  return u.toString();
}

const PETALS = 16;

/**
 * The finale (normal scroll, no pin), on the dressed temple damask — the last section:
 * "Thank You", the couple's love note as a quote, two temple elephants facing each other with the
 * couple's medallion between them, the names, date and city, Add to Calendar · Share · Replay,
 * and a last line of thanks. Petals fall as it arrives.
 */
export function ThankYouScene() {
  const { thankYou, loveNote, couple, wedding, events, venue, meta, personalization } = useWedding();
  const reduced = usePrefersReducedMotion();
  const { playSfx } = useAudio();
  const root = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState<"idle" | "copied" | "fail">("idle");

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.dateISO));
  const muh = events.find((e) => e.startISO === wedding.dateISO);
  const calUrl = calendarUrl(`${first.name} weds ${second.name} – Wedding`, wedding.dateISO, `${venue.name}, ${venue.address}`, muh?.endISO);
  const signature = loveNote?.signature ?? `${first.name} & ${second.name}`;

  // the closing sound: one soft temple bell strike with a long fade, once, as "Thank You" appears
  useSfxOnView("#thanks-heading", [["bell", { volume: 0.3, fadeOut: 3 }]], { threshold: 0.6, rootMargin: "0px" });

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      // the words rise in
      gsap.from(".ty-in", { autoAlpha: 0, y: 16, duration: 0.7, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 70%", once: true } });

      // a shower of petals from the top as the section comes in
      gsap.utils.toArray<HTMLElement>(".ty-fall", el).forEach((p, i) => {
        gsap.fromTo(
          p,
          { y: -30, x: 0, rotate: i * 41, autoAlpha: 0 },
          {
            keyframes: [
              { autoAlpha: 0.95, duration: 0.3 },
              { y: () => window.innerHeight * (0.7 + (i % 4) * 0.08), x: (i % 2 ? 1 : -1) * (24 + (i % 5) * 14), rotate: `+=${220 + i * 18}`, autoAlpha: 0, duration: 3.2, ease: "sine.in" },
            ],
            delay: (i % 8) * 0.18,
            scrollTrigger: { trigger: el, start: "top 65%", once: true },
          },
        );
      });

      // two temple elephants walk in — heavy steps, neck bells clanking — and one trumpets as the
      // couple's medallion rises between them
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector(".fn-scene"), start: "top 85%", once: true } });
      tl.from(".fn-ele--l", { autoAlpha: 0, x: -30, duration: 1, ease: "power2.out" }, 0)
        .from(".fn-ele--r", { autoAlpha: 0, x: 30, duration: 1, ease: "power2.out" }, "<")
        .from(".fn-medal", { autoAlpha: 0, y: 18, scale: 0.85, duration: 0.8, ease: "back.out(1.8)" }, "-=0.5")
        .fromTo(".fn-glow", { autoAlpha: 0.4, scale: 0.9 }, { autoAlpha: 1, scale: 1.06, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    }, el);
    return () => ctx.revert();
  }, [reduced, playSfx]);

  const share = async () => {
    const url = shareableUrl(personalization.queryParams);
    try {
      if (navigator.share) {
        await navigator.share({ title: meta.title, text: meta.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared("copied");
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return; // closed the share sheet
      setShared("fail");
    }
    window.setTimeout(() => setShared("idle"), 2400);
  };

  return (
    <section ref={root} id="thankYou" aria-labelledby="thanks-heading" className="fn-finale td-host td-bg relative isolate overflow-hidden text-center">
      <TempleDress deepams />
      <div className="ty-falls" aria-hidden>
        {Array.from({ length: PETALS }, (_, i) => (
          <span key={i} className={`ty-fall ${i % 3 === 0 ? "ty-fall--marigold" : i % 3 === 1 ? "ty-fall--jasmine" : ""}`} style={{ left: `${4 + ((i * 37) % 92)}%` }} />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-gutter pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[clamp(5.5rem,10vw,7.5rem)]">
        {/* 1 · thank you */}
        <p className="ty-in pm-eyebrow">॥ शुभमस्तु ॥</p>
        <h2 id="thanks-heading" className="ty-in pm-script-title mt-1">
          Thank You
        </h2>
        <GoldDivider className="ty-in mt-2" />
        <p className="ty-in pm-lede mt-1">{thankYou.message}</p>

        {/* 2 · the couple's love note, as a quote */}
        {loveNote && (
          <figure className="ty-in ty-note">
            <span aria-hidden className="ty-quote ty-quote--open">
              &ldquo;
            </span>
            <blockquote className="ty-note-text">{loveNote.text}</blockquote>
            <span aria-hidden className="ty-quote ty-quote--close">
              &rdquo;
            </span>
            <figcaption className="ty-note-sign">{signature}</figcaption>
          </figure>
        )}

        {/* 3 · two temple elephants facing each other, the couple's initials between them */}
        <div ref={scene} className="fn-scene" aria-hidden>
          <span className="fn-glow" />
          <img src="/media/elephant-warm.webp" alt="" className="fn-ele fn-ele--l" draggable={false} loading="lazy" decoding="async" />
          <span className="fn-medal">
            <span className="fn-medal-text">
              {first.name[0]} <span className="fn-amp">&amp;</span> {second.name[0]}
            </span>
          </span>
          <img src="/media/elephant-green.webp" alt="" className="fn-ele fn-ele--r" draggable={false} loading="lazy" decoding="async" />
          <span className="fn-floor" />
        </div>

        {/* 4 · names, date and city */}
        <p className="fn-names">
          {first.name} <span className="fn-amp">&amp;</span> {second.name}
        </p>
        <p className="fn-date">
          {date} · {wedding.city.split(",")[0]}
        </p>

        {/* 5 · add to calendar · share · replay */}
        <div className="ty-actions">
          <a href={calUrl} target="_blank" rel="noopener noreferrer" className="pm-btn pm-btn--solid">
            Add to Calendar
          </a>
          <button type="button" onClick={share} className="pm-btn pm-btn--ghost">
            {shared === "copied" ? "Link copied ✓" : shared === "fail" ? "Couldn’t share" : "Share Invitation"}
          </button>
          <button type="button" onClick={() => window.dispatchEvent(new Event("invitation:replay"))} className="pm-btn pm-btn--ghost">
            ↺&nbsp; Replay Invitation
          </button>
        </div>
        <span role="status" aria-live="polite" className="sr-only">
          {shared === "copied" ? "Invitation link copied" : ""}
        </span>

        {/* 6 · the last line */}
        <p className="mt-8 text-[0.8rem] italic text-[#e9d6b0]">Made with love for our families and friends.</p>
      </div>
    </section>
  );
}
