import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { CoupleLayers, type CoupleRefs } from "./CoupleLayers";

/**
 * Scene 6 — the couple. Revealed as the invitation's parchment lifts away.
 * Sky still, gopurams slow, the couple a little faster, banana trees and
 * marigold garlands sweep in fast from the sides; the names fade in on top.
 */
export function CoupleScene() {
  const { couple, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const refs = useRef<CoupleRefs>({}).current;
  const words = useRef<HTMLDivElement>(null);

  const build: Build = (tl) => {
    const $ = refs;
    tl.to($.sky!, { yPercent: -1.5, duration: 1.8 }, 0);
    if ($.scene) tl.fromTo($.scene, { yPercent: 7 }, { yPercent: 0, duration: 1.4, ease: "power1.out" }, 0);
    if ($.gopurams) tl.fromTo($.gopurams, { yPercent: 6 }, { yPercent: 0, duration: 1.4, ease: "power1.out" }, 0);
    if ($.couple) tl.fromTo($.couple, { yPercent: 14 }, { yPercent: 0, duration: 1.3, ease: "power2.out" }, 0);
    if ($.bananaL) tl.fromTo($.bananaL, { xPercent: -40 }, { xPercent: 0, duration: 1, ease: "power2.out" }, 0.1);
    if ($.bananaR) tl.fromTo($.bananaR, { xPercent: 40 }, { xPercent: 0, duration: 1, ease: "power2.out" }, 0.1);
    if ($.garlands) tl.fromTo($.garlands, { yPercent: -35 }, { yPercent: 0, duration: 1, ease: "power2.out" }, 0.2);
    tl.from(words.current!.children, { autoAlpha: 0, y: 24, duration: 0.4, stagger: 0.12, ease: "power2.out" }, 0.8).to({}, { duration: 0.3 });
  };

  return (
    <Scene id="couple" labelledBy="couple-heading" className="bg-[#a9cdee]" build={build}>
      <CoupleLayers fallback={media.couple} alt={`${first.name} and ${second.name} exchanging garlands in a temple courtyard`} refs={refs} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-[rgb(28_62_112/0.35)] to-transparent" />
      <div ref={words} className="absolute inset-x-0 top-[7svh] text-center text-white [text-shadow:0_3px_22px_rgb(24_52_96/0.6)]">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.38em]">The couple</p>
        <h2 id="couple-heading" className="mt-2 font-script font-normal leading-none">
          <span className="text-[clamp(2.6rem,12vw,5rem)]">{first.name}</span>
          <span className="mx-2 text-[clamp(1.6rem,7vw,3rem)]">&amp;</span>
          <span className="text-[clamp(2.6rem,12vw,5rem)]">{second.name}</span>
        </h2>
      </div>
    </Scene>
  );
}
