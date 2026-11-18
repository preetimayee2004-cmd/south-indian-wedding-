import { useRef } from "react";
import type { FamilySide } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { FamilyPanel } from "@/components/sections/family/FamilyPanel";

type Key = "bride" | "groom";

/**
 * Scene 8 — Our Families. A parchment card inside a temple-frieze border
 * rises over the journey; the bride's side slides in from the left and the
 * groom's from the right.
 */
export function FamiliesScene() {
  const { family, couple } = useWedding();
  const order: Key[] = couple.order === "bride-first" ? ["bride", "groom"] : ["groom", "bride"];
  const sides = order.filter((k) => family?.[k]);
  const card = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const panels = useRef<Record<string, HTMLElement | null>>({});
  const body = useRef<HTMLDivElement>(null);

  if (!sides.length) return null;

  const build: Build = (tl) => {
    tl.fromTo(card.current, { yPercent: 8, scale: 0.94 }, { yPercent: 0, scale: 1, duration: 0.5, ease: "power2.out" }, 0)
      .from(head.current!.children, { autoAlpha: 0, y: 16, duration: 0.3, stagger: 0.1, ease: "power2.out" }, 0.2)
      .fromTo(panels.current.bride, { xPercent: -115 }, { xPercent: 0, duration: 0.6, ease: "power2.out" }, 0.5)
      .fromTo(panels.current.groom, { xPercent: 115 }, { xPercent: 0, duration: 0.6, ease: "power2.out" }, 0.75);
    // tiny screens: let the card's content drift up so nothing is cut off
    const box = body.current!;
    tl.to(box.firstElementChild, { y: () => -Math.max(0, (box.firstElementChild as HTMLElement).offsetHeight - box.clientHeight), duration: 0.5 }, 1.2).to({}, { duration: 0.2 });
  };

  return (
    <Scene
      id="family"
      labelledBy="family-heading"
      className="bg-[#7a2e2a]"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-frieze-top" />}
    >
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(45deg, rgb(255 255 255 / 0.03) 0 6px, transparent 6px 14px), linear-gradient(#7a2e2a, #5e211e)" }} />
      <div className="relative flex h-full items-center justify-center px-[14px] py-[max(1.25rem,3svh)]">
        <div ref={card} data-layer className="parchment frieze-border relative flex max-h-full w-full max-w-[30rem] flex-col overflow-hidden rounded-[6px] px-3 pb-4 pt-5">
          <div ref={head} className="text-center">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-ink">With the blessings of</p>
            <h2 id="family-heading" className="script-heading mt-1 text-[clamp(2.2rem,10vw,3.4rem)] leading-none">
              Our Families
            </h2>
          </div>
          <div ref={body} className="relative mt-3 min-h-0 flex-1 overflow-hidden">
            <div className="flex flex-col gap-4">
              {sides.map((k, i) => (
                <div key={k}>
                  {i > 0 && <span aria-hidden className="mx-auto mb-4 block h-px w-24 bg-gold/70" />}
                  <div ref={(el) => void (panels.current[k] = el)} data-layer>
                    <FamilyPanel side={family![k] as FamilySide} headingId={`fam-${k}`} compact />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
