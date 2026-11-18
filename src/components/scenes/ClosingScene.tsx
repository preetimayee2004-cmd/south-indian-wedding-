import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Cloud } from "@/components/scene/Decor";
import { art2x } from "@/lib/art";
import { TEMPLE_SKY } from "./TempleHeroScene";

/**
 * The last page (as in the reference's Amer Fort section): the city's temple
 * and its clouds wait below the ground and, the first time the section's top
 * passes 70% of the screen (or the whole section is in view), rise one after
 * another, with the city's name above. Plays once; scrolling back does not
 * replay it. Reduced motion: everything simply shows in place.
 */
export function ClosingScene() {
  const { media, wedding, loveStory } = useWedding();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const city = loveStory?.livesOn.city ?? wedding.city.split(",")[0];
  const native = loveStory?.livesOn.native;

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>("[data-rise]");
      gsap.set(layers, { yPercent: 110 });
      gsap.set("[data-name] > *", { opacity: 0, y: 16 });
      const play = () =>
        gsap
          .timeline()
          .to(layers, { yPercent: 0, duration: 1.4, stagger: 0.22, ease: "power3.out" })
          .to("[data-name] > *", { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power2.out" }, 0.6);
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 70%",
        once: true,
        onEnter: play,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="closing" aria-label={`${city} — the end of the invitation`} className="relative h-[100svh] min-h-[520px] overflow-hidden" style={{ backgroundColor: TEMPLE_SKY }}>
      <div data-name className="absolute inset-x-0 top-[9svh] z-10 text-center">
        <p className="text-[clamp(2.4rem,12vw,4.5rem)] font-bold uppercase leading-none tracking-[0.18em] text-[#f3cf73]">{city}</p>
        {native && <p className="mt-2 text-[1.3rem] text-[#fbf2dc]">{native}</p>}
      </div>

      <div data-rise className="absolute inset-x-0 bottom-[30%] h-[22%]">
        <Cloud className="left-[-8%] top-0 h-full w-[46%]" opacity={0.8} />
        <Cloud className="right-[-10%] top-[20%] h-[80%] w-[40%]" opacity={0.75} />
      </div>
      <div data-rise className="absolute inset-x-0 bottom-0 h-[64%]">
        <img src={art2x(media.invitation).src} alt={`The temple of ${city}`} loading="lazy" decoding="async" className="h-full w-full object-cover object-top" draggable={false} />
      </div>
      <div data-rise className="absolute inset-x-0 bottom-[-4%] h-[18%]">
        <Cloud className="left-[-14%] top-0 h-full w-[60%]" />
        <Cloud className="right-[-16%] top-[10%] h-[90%] w-[58%]" opacity={0.92} />
      </div>
    </section>
  );
}
