import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { STAGE_RATIO } from "./TempleStage";

/**
 * The street between the hero and the invitation (as in the reference: building,
 * street, paper). A full-width strip of repeating paving that overlaps the
 * bottom 10% of the hero picture — so the temple stands on the street — with
 * sprites moving along it with the scroll (each with a small bob), their feet
 * or wheels on one baseline. Under it a thin gold line and a soft shadow, where
 * the parchment begins.
 */
export function StreetStrip() {
  const { media } = useWedding();
  const street = media.street;
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const sprites = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!street || reduced || !root.current) return;
    const ctx = gsap.context(() => {
      street.sprites.forEach((sp, i) => {
        const el = sprites.current[i];
        if (!el) return;
        // left → right: from beyond the left edge; right → left: from beyond the right edge
        const span = () => window.innerWidth + el.offsetWidth;
        const lead = (0.1 + 0.15 * i) * window.innerWidth; // each starts a little further off, so they don't bunch up
        const from = () => (sp.dir === 1 ? -el.offsetWidth - lead : window.innerWidth + lead);
        gsap.fromTo(
          el,
          { x: from },
          { x: () => from() + sp.dir * sp.speed * span(), ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: SCRUB, invalidateOnRefresh: true } },
        );
      });
    }, root);
    return () => ctx.revert();
  }, [street, reduced]);

  if (!street) return null;
  return (
    <div
      ref={root}
      aria-hidden
      className="street-strip relative z-[15]"
      style={{
        // overlap the bottom 10% of the hero picture (which spans the full width)
        marginTop: `calc(-0.1 * 100vw / ${STAGE_RATIO.toFixed(4)})`,
        backgroundImage: `url("${street.tile}")`,
      }}
    >
      {street.sprites.map((sp, i) => (
        <div
          key={i}
          ref={(el) => void (sprites.current[i] = el)}
          className="street-sprite"
          style={{
            height: `${sp.height * 100}%`,
            aspectRatio: `${sp.ratio}`,
            left: reduced ? `${15 + i * 30}%` : 0,
          }}
        >
          <img src={sp.src} alt="" decoding="async" className="street-bob block h-full w-full" style={{ animationDelay: `${-i * 0.37}s` }} draggable={false} />
        </div>
      ))}
    </div>
  );
}
