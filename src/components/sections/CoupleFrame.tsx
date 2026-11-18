import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { artProps } from "@/lib/art";

/**
 * The couple. As the section scrolls in, the picture drifts up slower than
 * the page; then it holds while the camera settles back and the couple
 * "arrives" in the centre, their names appearing on the sky above them.
 */
export function CoupleFrame() {
  const { couple, media } = useWedding();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  useLayoutEffect(() => {
    if (reduced || !root.current) return;
    const ctx = gsap.context(() => {
      // approaching: slower than the page (parallax)
      gsap.fromTo(img.current, { yPercent: 10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true } });
      // held: the couple settles into place, then the names arrive
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=90%", pin: true, scrub: 0.6, anticipatePin: 1 } })
        .fromTo(img.current, { scale: 1.32, transformOrigin: "52% 62%" }, { scale: 1, duration: 0.7, ease: "power2.out" }, 0)
        .fromTo(words.current!.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08, ease: "power2.out" }, 0.45)
        .to({}, { duration: 0.2 });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="couple" aria-labelledby="couple-heading" className="relative isolate h-[100svh] min-h-[560px] overflow-hidden bg-[linear-gradient(#C5E4EA,#F9E6BD)]">
      <img
        ref={img}
        {...artProps(media.couple)}
        alt={`${first.name} and ${second.name} exchanging garlands in a temple courtyard`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[50%_55%]"
        draggable={false}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-[rgb(28_62_112/0.35)] to-transparent" />
      <div ref={words} className="absolute inset-x-0 top-[7svh] text-center text-white [text-shadow:0_3px_22px_rgb(24_52_96/0.55)] md:top-[6vh]">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.38em] md:text-[0.85rem]">The couple</p>
        <h2 id="couple-heading" className="mt-2 font-script font-normal leading-none">
          <span className="text-[clamp(2.8rem,6vw,5.5rem)]">{first.name}</span>
          <span className="mx-3 text-[clamp(1.8rem,3.5vw,3rem)]">&amp;</span>
          <span className="text-[clamp(2.8rem,6vw,5.5rem)]">{second.name}</span>
        </h2>
      </div>
    </section>
  );
}
