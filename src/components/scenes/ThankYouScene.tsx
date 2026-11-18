import { useRef } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Ornament } from "@/components/ui/Ornament";
import { art2x } from "@/lib/art";
import { COUPLE_BG, Petals, addPetals } from "./CoupleScene";

/**
 * Scene 11 — Thank You. The couple picture again, cropped to the couple,
 * easing back from 1 to 0.9 as you scroll while petals fall; "Thank You"
 * fades in above them and the rest of the words follow. Monogram + footer
 * come after.
 */
export function ThankYouScene() {
  const { thankYou, couple, wedding, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const pic = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  const build: Build = (tl) => {
    tl.fromTo(pic.current, { scale: 1 }, { scale: 0.9, duration: 2, ease: "none" }, 0)
      .from(head.current!.children, { opacity: 0, y: 16, duration: 0.4, stagger: 0.15, ease: "power2.out" }, 0.2)
      .from(words.current!.children, { opacity: 0, y: 12, duration: 0.3, stagger: 0.12, ease: "power2.out" }, 0.7);
    addPetals(tl, petals.current, 0, 2);
  };

  return (
    <Scene
      id="thankYou"
      labelledBy="thanks-heading"
      style={{ background: COUPLE_BG }}
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#C5E4EA" }} />}
    >
      <div className="relative mx-auto flex h-full max-w-[34rem] flex-col items-center px-gutter pb-[max(1rem,2svh)] pt-[max(1.25rem,4svh)] text-center">
        <div ref={head}>
          <p className="text-eyebrow uppercase text-maroon">With gratitude</p>
          <h2 id="thanks-heading" className="script-heading mt-1 text-[clamp(2.8rem,13vw,4.6rem)] leading-none">
            Thank You
          </h2>
        </div>

        {/* the couple, cropped; the layer is a little larger than its window so easing back to 0.9 never shows an edge */}
        <div className="relative mt-3 w-full min-h-0 flex-1 overflow-hidden rounded-t-[999px] border border-gold/50">
          <div ref={pic} data-layer className="absolute -inset-[6%]">
            <img
              {...art2x(media.thankYou)}
              alt={`${first.name} and ${second.name} exchanging garlands`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 58%" }}
              draggable={false}
            />
          </div>
        </div>

        <div ref={words} className="mt-3">
          <p className="mx-auto max-w-[21rem] text-[1.05rem] leading-snug text-ink [text-wrap:balance]">{thankYou.message}</p>
          <div className="mt-1.5 flex justify-center">
            <Ornament className="text-gold" />
          </div>
          <p className="mt-1 font-script text-[clamp(2rem,9vw,3rem)] leading-none text-accent">
            {first.name} &amp; {second.name}
          </p>
          {thankYou.quote && <p className="mx-auto mt-1.5 max-w-[19rem] text-[0.95rem] italic leading-snug text-ink">“{thankYou.quote}”</p>}
          {wedding.blessing && <p className="mt-1.5 text-[0.75rem] tracking-[0.3em] text-ink">{wedding.blessing}</p>}
        </div>
      </div>
      <Petals refs={petals} z="z-30" />
    </Scene>
  );
}
