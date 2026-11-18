import { useRef, type ReactNode } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Ornament } from "@/components/ui/Ornament";
import { CoupleLayers, type CoupleRefs } from "./CoupleLayers";

/** Handwriting reveal with transforms only: the window slides right while its content holds still. */
function WriteIn({ children }: { children: ReactNode }) {
  return (
    <span data-write className="inline-block overflow-hidden px-[0.4em] py-[0.1em] align-bottom">
      <span className="inline-block">{children}</span>
    </span>
  );
}

/**
 * Scene 11 — Thank You. The couple scene returns: gopurams rise, then the
 * couple rises in front. A parchment panel comes up beneath them and
 * "Thank You" and the names write themselves in. Monogram + footer follow.
 */
export function ThankYouScene() {
  const { thankYou, couple, wedding, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const refs = useRef<CoupleRefs>({}).current;
  const panel = useRef<HTMLDivElement>(null);

  const build: Build = (tl, el) => {
    const $ = refs;
    if ($.scene) tl.fromTo($.scene, { yPercent: 30 }, { yPercent: 0, duration: 1, ease: "power2.out" }, 0);
    if ($.gopurams) tl.fromTo($.gopurams, { yPercent: 30 }, { yPercent: 0, duration: 1, ease: "power2.out" }, 0);
    if ($.couple) tl.fromTo($.couple, { yPercent: 45 }, { yPercent: 0, duration: 1, ease: "power2.out" }, 0.3);
    if ($.bananaL) tl.fromTo($.bananaL, { xPercent: -40 }, { xPercent: 0, duration: 0.8 }, 0.3);
    if ($.bananaR) tl.fromTo($.bananaR, { xPercent: 40 }, { xPercent: 0, duration: 0.8 }, 0.3);
    if ($.garlands) tl.fromTo($.garlands, { yPercent: -35 }, { yPercent: 0, duration: 0.8 }, 0.4);
    tl.fromTo(panel.current, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power2.out" }, 0.6);
    const fades = el.querySelectorAll("[data-fade]");
    tl.from(fades, { autoAlpha: 0, y: 12, duration: 0.3, stagger: 0.12 }, 1.2);
    el.querySelectorAll<HTMLElement>("[data-write]").forEach((w, i) => {
      tl.fromTo(w, { xPercent: -100 }, { xPercent: 0, duration: 0.6, ease: "power1.inOut" }, 1.1 + i * 0.5).fromTo(
        w.firstElementChild,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.6, ease: "power1.inOut" },
        1.1 + i * 0.5,
      );
    });
    tl.to({}, { duration: 0.4 });
  };

  return (
    <Scene
      id="thankYou"
      labelledBy="thanks-heading"
      className="bg-[#a9cdee]"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#a9cdee" }} />}
    >
      <div className="absolute inset-x-0 top-0 h-[62%] overflow-hidden">
        <CoupleLayers fallback={media.thankYou} alt={`${first.name} and ${second.name} exchanging garlands in a temple courtyard`} refs={refs} />
      </div>

      <div ref={panel} data-layer className="parchment absolute inset-x-0 bottom-0 h-[50%]">
        <div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#f5e8c9" }} />
        <div className="flex h-full flex-col items-center justify-center px-gutter text-center">
          <p data-fade className="text-eyebrow uppercase text-ink">
            With gratitude
          </p>
          <h2 id="thanks-heading" className="script-heading mt-1 text-[clamp(2.8rem,13vw,4.6rem)] leading-none">
            <WriteIn>Thank You</WriteIn>
          </h2>
          <p data-fade className="mx-auto mt-2 max-w-[21rem] text-[1.05rem] leading-snug text-ink [text-wrap:balance]">
            {thankYou.message}
          </p>
          <div data-fade className="mt-2 flex justify-center">
            <Ornament className="text-gold" />
          </div>
          <p className="mt-1 font-script text-[clamp(2rem,9vw,3.2rem)] leading-none text-accent">
            <WriteIn>
              {first.name} &amp; {second.name}
            </WriteIn>
          </p>
          {thankYou.quote && (
            <p data-fade className="mx-auto mt-2 max-w-[19rem] text-[0.95rem] italic leading-snug text-ink">
              “{thankYou.quote}”
            </p>
          )}
          {wedding.blessing && (
            <p data-fade className="mt-2 text-[0.75rem] tracking-[0.3em] text-ink">
              {wedding.blessing}
            </p>
          )}
        </div>
      </div>
    </Scene>
  );
}
