import { useLayoutEffect, useRef, useState } from "react";
import { useWedding } from "@/context/WeddingContext";
import { useAudio } from "@/context/AudioContext";
import { useSfxOnView } from "@/hooks/useSfxOnView";
import { GoldDivider } from "@/components/ui/GoldDivider";
import { TempleDress } from "@/components/ui/TempleDress";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { gsap } from "@/lib/gsap";

/** Link to share: the page without personal params, so a forwarded link never carries this guest's name. */
function shareableUrl(dropParams: string[]): string {
  const u = new URL(window.location.href);
  [...dropParams, "nointro", "tokens", "wishdemo", "rsvpform"].forEach((p) => u.searchParams.delete(p));
  u.hash = "";
  return u.toString();
}

/**
 * The closing finale, on the dressed temple damask: "Thank you, with love", two caparisoned temple
 * elephants facing each other on a gold floor line with the couple's initials in a gold medallion
 * between them, the couple's names, the date and city, Share Invitation (native share sheet on
 * phones, copy link elsewhere) and a last line of thanks.
 */
export function Footer() {
  const { couple, wedding, meta, personalization } = useWedding();
  const reduced = usePrefersReducedMotion();
  const { playSfx } = useAudio();
  const root = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  // reduced motion: no walk-in, but the elephants are still heard
  useSfxOnView(scene, [["elephant", { volume: 0.75 }], ["trumpet", { volume: 0.5, delay: 1.3 }]], { enabled: reduced });
  const [shared, setShared] = useState<"idle" | "copied" | "fail">("idle");

  const date = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.dateISO));
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

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
      if ((e as DOMException)?.name === "AbortError") return; // user closed the share sheet
      setShared("fail");
    }
    window.setTimeout(() => setShared("idle"), 2400);
  };

  // the elephants and the medallion rise in, and the glow behind them breathes, once in view
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector(".fn-scene"), start: "top 85%", once: true } });
      // two temple elephants walk in — heavy steps, neck bells clanking
      tl.call(() => playSfx("elephant", { volume: 0.75 }), undefined, 0)
        .from(".fn-ele--l", { autoAlpha: 0, x: -30, duration: 1, ease: "power2.out" }, 0)
        .from(".fn-ele--r", { autoAlpha: 0, x: 30, duration: 1, ease: "power2.out" }, "<")
        .from(".fn-medal", { autoAlpha: 0, y: 18, scale: 0.85, duration: 0.8, ease: "back.out(1.8)" }, "-=0.5")
        // and one of them trumpets as the couple's medallion rises between them
        .call(() => playSfx("trumpet", { volume: 0.5 }), undefined, "<")
        .fromTo(".fn-glow", { autoAlpha: 0.4, scale: 0.9 }, { autoAlpha: 1, scale: 1.06, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    }, el);
    return () => ctx.revert();
  }, [reduced, playSfx]);

  return (
    <footer ref={root} className="fn-finale td-host td-bg relative z-[95] overflow-hidden text-center">
      <TempleDress deepams />
      <div className="relative z-10 mx-auto max-w-3xl px-gutter pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[clamp(5.5rem,10vw,7.5rem)]">
        <p className="pm-eyebrow">Thank you,</p>
        <h2 className="fn-title">with love</h2>
        <GoldDivider className="mt-2" />

        {/* two temple elephants facing each other, the couple's initials between them */}
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

        <p className="fn-names">
          {first.name} <span className="fn-amp">&amp;</span> {second.name}
        </p>
        <p className="fn-date">
          {date} · {wedding.city.split(",")[0]}
        </p>

        <div className="mt-7 flex justify-center">
          <button type="button" onClick={share} className="pm-btn pm-btn--ghost">
            {shared === "copied" ? "Link copied ✓" : shared === "fail" ? "Couldn’t share" : "Share Invitation"}
          </button>
        </div>
        <span role="status" aria-live="polite" className="sr-only">
          {shared === "copied" ? "Invitation link copied" : ""}
        </span>

        <p className="mt-8 text-[0.8rem] italic text-[#e9d6b0]">Made with love for our families and friends.</p>
      </div>
    </footer>
  );
}
