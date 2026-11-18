import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Cloud } from "@/components/scene/Decor";
import { artProps, naturalSize } from "@/lib/art";

/**
 * The last page: the city's temple and its flat clouds wait below the ground
 * and, the first time the section's top passes 70% of the screen, rise one
 * after another, with the city's name above. The clouds sit behind the temple;
 * the temple's lower edge fades into the sky, so it flows into the footer
 * (same sky) with no horizontal cut. Plays once. Reduced motion: shows in place.
 */
export function ClosingScene() {
  const { media, wedding, loveStory } = useWedding();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const city = loveStory?.livesOn.city ?? wedding.city.split(",")[0];
  const native = loveStory?.livesOn.native;
  const nat = naturalSize(media.invitation) ?? { w: 3, h: 4 };

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
      ScrollTrigger.create({ trigger: root.current, start: "top 70%", once: true, onEnter: play });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  const fade = "linear-gradient(to bottom, #000 0%, #000 58%, transparent 100%)";

  return (
    <section ref={root} id="closing" aria-label={`${city} — the end of the invitation`} className="cobalt relative h-[100svh] min-h-[520px] overflow-hidden">
      <div data-name className="absolute inset-x-0 top-[9svh] z-10 text-center">
        <p className="text-[clamp(2.4rem,12vw,4.5rem)] font-bold uppercase leading-none tracking-[0.18em] text-[#f3cf73]">{city}</p>
        {native && <p className="mt-2 text-[1.3rem] text-[#fbf2dc]">{native}</p>}
      </div>

      {/* flat clouds, behind the temple */}
      <div data-rise className="absolute inset-x-0 bottom-[34%] z-0 h-[16%]">
        <Cloud className="left-[-6%] top-0 h-full w-[44%]" />
        <Cloud className="right-[-8%] top-[24%] h-[76%] w-[38%]" />
      </div>

      {/* the temple: its natural silhouette against the sky, lower edge fading into it */}
      <div data-rise className="absolute inset-x-0 bottom-0 z-[1] flex h-[66%] justify-center">
        <img
          {...artProps(media.invitation, `min(100vw, calc(66vh * ${(nat.w / nat.h).toFixed(3)}))`)}
          alt={`The temple of ${city}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full max-w-[min(100%,calc(66svh*0.747))] object-cover object-top"
          style={{ WebkitMaskImage: fade, maskImage: fade }}
          draggable={false}
        />
      </div>
    </section>
  );
}
