import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { TempleHeroScene } from "./TempleHeroScene";

/** The temple mandapam: tiled roof on two pillars over a carved plinth with steps in the middle
 *  (1192×742, cropped; its flat blue background keyed out and its colours matched to the hero
 *  with scripts/match-hero-colours.mjs, so the sky shows through). */
const ARCH = "/media/invite-arch.webp";
const ARCH_W = 1192;
const ARCH_H = 742;
/** The brass lamps, lotus bowls and steps that stand in front of the plinth
 *  (cut from the same art: x 348–848, y 511–742 of 1192×742). */
const FRONT = { src: "/media/invite-arch-front.webp", left: 348 / ARCH_W, width: 500 / ARCH_W, ratio: "1000 / 462" };

/**
 * The invitation section: scene 1 (hero + temple) scrolls away upward, and the
 * mandapam follows right below it on the parchment, easing up into place.
 */
export function InvitationStage() {
  return (
    <>
      <TempleHeroScene tail={0} />
      <ArchScene />
    </>
  );
}

/**
 * The invitation section, for now just its setting: the temple's stone floor ends on a
 * carved kerb (the hero's section ending), then cream parchment, and the painted
 * mandapam standing on it at its natural shape — tiled roof, pillars and plinth, with
 * the brass lamps, lotus bowls and steps in front. It eases up into place as it arrives.
 */
export function ArchScene() {
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);

  // the mandapam rises a little faster than the page and docks as it arrives
  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        box.current,
        { y: () => window.innerHeight * 0.3 },
        { y: 0, ease: "power1.out", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: SCRUB, invalidateOnRefresh: true } },
      );
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="invitation" aria-label="The temple mandapam" className="parchment-ground relative overflow-x-clip pb-10">
      {/* the temple's stone floor ends here on a carved kerb, then parchment */}
      <div aria-hidden className="ground-kerb" />
      <div aria-hidden className="h-[96px]" />
      {/* the mandapam: full width, and at least 31.75rem (on phones the pillars sit just past the screen edges) */}
      <div className="relative left-1/2 -translate-x-1/2" style={{ width: "max(31.75rem, 100vw)" }}>
        <div
          ref={box}
          data-layer
          className="relative w-full"
          style={{ aspectRatio: `${ARCH_W} / ${ARCH_H}` }}
          role="img"
          aria-label="A painted temple mandapam: a red tiled roof with goddess niches and golden finials on two teal pillars, over a carved plinth with steps, brass lamps and lotus bowls"
        >
          <img src={ARCH.replace(/\.webp$/, "@2x.webp")} alt="" decoding="async" className="absolute inset-0 block h-full w-full" draggable={false} />
          {/* the lamps, lotus bowls and steps in front of the plinth */}
          <img
            aria-hidden
            src={FRONT.src}
            alt=""
            decoding="async"
            className="pointer-events-none absolute bottom-0 z-[2]"
            style={{ left: `${FRONT.left * 100}%`, width: `${FRONT.width * 100}%`, aspectRatio: FRONT.ratio }}
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
