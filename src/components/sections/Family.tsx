import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap } from "@/lib/gsap";
import type { FamilySide } from "@/config/types";
import { useWedding } from "@/context/WeddingContext";
import { useIsTablet, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { FamilyPanel } from "./family/FamilyPanel";
import { artProps } from "@/lib/art";

type Key = "bride" | "groom";
const IMG_RATIO = 1200 / 896;
const GATE_W = "min(115vw, 60rem)"; // slightly wider than phones so the pillars frame the edges

/**
 * Section 05 — Our Families.
 * A painted gopuram gateway crowns the section; its parchment centre carries
 * on below as a hanging scroll that unrolls as you scroll. Phones: the two
 * families sit on one leaf that turns (3D flip) between them via tabs.
 * Tablet/desktop: both families side by side.
 */
export function Family() {
  const { family, couple, media } = useWedding();
  const reduced = usePrefersReducedMotion();
  const wide = useIsTablet();
  const p = media.familyParchment;

  const order: Key[] = couple.order === "bride-first" ? ["bride", "groom"] : ["groom", "bride"];
  const sides = order.filter((k) => family?.[k]) as Key[];
  const [shown, setShown] = useState<Key>(sides[0] ?? "bride");
  const busy = useRef(false);

  const gate = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const leaf = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    if (reduced || !sides.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        gate.current,
        { yPercent: -10 },
        { yPercent: 0, ease: "none", scrollTrigger: { trigger: gate.current, start: "top bottom", end: "top 20%", scrub: true } },
      );
      gsap.from(titleRef.current!.children, {
        autoAlpha: 0,
        y: 14,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: { trigger: titleRef.current, start: "top 80%", once: true },
      });
      // The scroll unrolls with the page.
      gsap.fromTo(
        band.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: band.current, start: "top 92%", end: "top 30%", scrub: 0.4 } },
      );
      gsap.from(band.current!.querySelectorAll(".fam-member"), {
        autoAlpha: 0,
        scale: 0.7,
        duration: 0.6,
        ease: "back.out(1.8)",
        stagger: 0.08,
        scrollTrigger: { trigger: band.current, start: "top 45%", once: true },
      });
    });
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, wide]);

  if (!sides.length) return null;

  const turnTo = (k: Key) => {
    if (k === shown || busy.current) return;
    if (reduced || !leaf.current) return setShown(k);
    busy.current = true;
    const dir = sides.indexOf(k) > sides.indexOf(shown) ? -1 : 1;
    gsap.to(leaf.current, {
      rotateY: dir * 90,
      opacity: 0.3,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        flushSync(() => setShown(k));
        gsap.fromTo(
          leaf.current,
          { rotateY: -dir * 90, opacity: 0.3 },
          { rotateY: 0, opacity: 1, duration: 0.45, ease: "power2.out", onComplete: () => void (busy.current = false) },
        );
      },
    });
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = sides.indexOf(shown);
    const next = sides[(i + (e.key === "ArrowRight" ? 1 : -1) + sides.length) % sides.length];
    turnTo(next);
    tabRefs.current[next]?.focus();
  };

  const label = (k: Key) => (k === "bride" ? `${couple.bride.name}'s family` : `${couple.groom.name}'s family`);

  return (
    <section id="family" aria-labelledby="family-heading" className="relative isolate overflow-x-clip pt-12">
      {/* ── Gateway crown ── */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: GATE_W, aspectRatio: String(IMG_RATIO) }}>
        <div ref={gate} className="absolute inset-0">
        <img
          {...artProps(media.family)}
          alt="A painted temple gateway crowned with Ganesha, Murugan with his consorts, and Lakshmi"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0, black 14%), linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 14%), linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
          draggable={false}
        />
        <div
          ref={titleRef}
          className="absolute flex flex-col items-center justify-center text-center"
          style={{ left: `${p.left}%`, width: `${p.width}%`, top: `${p.top + 6}%`, bottom: 0 }}
        >
          <p className="text-[0.62rem] uppercase tracking-[0.3em] text-ink-soft md:text-eyebrow">With the blessings of</p>
          <h2 id="family-heading" className="script-heading mt-1 text-[clamp(2.2rem,10vw,4rem)] leading-none">
            Our Families
          </h2>
        </div>
        </div>
      </div>

      {/* ── Hanging scroll ── */}
      <div
        ref={band}
        className="relative mx-auto -mt-px"
        style={{ width: `calc(${GATE_W} * ${p.width / 100})`, background: `linear-gradient(to bottom, ${p.color}, #f5e2ae 60%, #f3e3bb)` }}
      >
        <div className="px-4 pb-14 pt-8 md:px-10">
          {!wide && sides.length > 1 && (
            <div role="tablist" aria-label="Families" className="relative mx-auto mb-8 grid max-w-[17rem] grid-cols-2 rounded-full border border-gold/60 p-1">
              <span
                aria-hidden
                className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-accent transition-transform duration-500 ease-silk"
                style={{ transform: `translateX(${sides.indexOf(shown) * 100}%)` }}
              />
              {sides.map((k) => (
                <button
                  key={k}
                  ref={(el) => void (tabRefs.current[k] = el)}
                  role="tab"
                  id={`fam-tab-${k}`}
                  aria-selected={shown === k}
                  aria-controls="fam-leaf"
                  tabIndex={shown === k ? 0 : -1}
                  onClick={() => turnTo(k)}
                  onKeyDown={onTabKey}
                  className={`relative z-10 rounded-full px-2 py-2 text-[0.68rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                    shown === k ? "text-paper" : "text-ink-soft"
                  }`}
                >
                  {k === "bride" ? "Bride's side" : "Groom's side"}
                </button>
              ))}
            </div>
          )}

          {wide ? (
            <div className="grid grid-cols-2 divide-x divide-gold/40">
              {sides.map((k) => (
                <div key={k} className="px-6">
                  <FamilyPanel side={family![k] as FamilySide} headingId={`fam-${k}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="[perspective:1100px]">
              <div
                ref={leaf}
                id="fam-leaf"
                role={sides.length > 1 ? "tabpanel" : undefined}
                aria-labelledby={sides.length > 1 ? `fam-tab-${shown}` : undefined}
                aria-label={sides.length > 1 ? undefined : label(shown)}
                className="[backface-visibility:hidden] [transform-style:preserve-3d]"
              >
                <FamilyPanel side={family![shown] as FamilySide} headingId={`fam-${shown}`} />
              </div>
            </div>
          )}
        </div>
        {/* scalloped hem */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-full h-3"
          style={{ background: `radial-gradient(circle at 50% 0, #f3e3bb 68%, transparent 70%) 0 0 / 22px 12px repeat-x` }}
        />
      </div>
      <div className="h-section" aria-hidden />
    </section>
  );
}
