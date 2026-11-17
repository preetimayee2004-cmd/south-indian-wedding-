import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Container } from "@/components/layout/Container";
import { EdgeFade } from "@/components/ui/EdgeFade";
import { Ornament } from "@/components/ui/Ornament";

const IMG_RATIO = 1376 / 768;
const PETALS = 9;

/**
 * Section 10 — Thank You.
 * The garland-exchange scene is wider than a phone, so the camera pans across
 * it as you scroll (scrubbed), and a single shower of petals falls once.
 * Below, "Thank you" and the couple's names write themselves in, left to right.
 */
export function ThankYou() {
  const { thankYou, couple, wedding, media } = useWedding();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const petals = useRef<HTMLDivElement>(null);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      // Pan: from the left edge of the scene to the right edge (0 if it already fits).
      const travel = () => Math.max(0, band.current!.offsetHeight * IMG_RATIO - band.current!.offsetWidth);
      gsap.fromTo(
        img.current,
        { x: 0 },
        {
          x: () => -travel(),
          ease: "none",
          scrollTrigger: { trigger: band.current, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true },
        },
      );

      // One gentle shower of petals, the first time the scene is in view.
      const ps = gsap.utils.toArray<HTMLElement>(petals.current!.children);
      gsap.set(ps, { yPercent: -200, autoAlpha: 0 });
      gsap.to(ps, {
        autoAlpha: 1,
        y: () => band.current!.offsetHeight + 40,
        x: () => gsap.utils.random(-50, 50),
        rotate: () => gsap.utils.random(-260, 260),
        duration: () => gsap.utils.random(4.5, 7),
        delay: (i: number) => i * 0.35,
        ease: "sine.in",
        scrollTrigger: { trigger: band.current, start: "top 60%", once: true },
      });

      // Handwriting: each script line is unveiled left → right.
      gsap.utils.toArray<HTMLElement>(".write-in").forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(-20% 100% -20% 0%)" },
          {
            clipPath: "inset(-20% 0% -20% 0%)",
            duration: 1.6,
            ease: "power1.inOut",
            delay: i * 0.25,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });
      gsap.from(".ty-fade", {
        autoAlpha: 0,
        y: 12,
        duration: 0.9,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: { trigger: ".ty-text", start: "top 75%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={root} id="thankYou" aria-labelledby="thanks-heading" className="relative isolate pb-section">
      {/* ── Panning scene ── */}
      <div ref={band} className="relative overflow-hidden bg-[#a9cdee]" style={{ height: "min(72svh, 640px)" }}>
        <EdgeFade top />
        <img
          ref={img}
          src={media.thankYou}
          alt={`${first.name} and ${second.name} exchanging garlands in a temple courtyard`}
          loading="lazy"
          decoding="async"
          className="absolute left-0 top-0 h-full w-auto max-w-none"
          style={{ aspectRatio: String(IMG_RATIO), minWidth: "100%", objectFit: "cover" }}
          draggable={false}
        />
        <div ref={petals} aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: PETALS }, (_, i) => (
            <span
              key={i}
              className="absolute top-0 block h-3 w-2 rounded-[60%_40%_60%_40%]"
              style={{ left: `${8 + ((i * 37) % 86)}%`, background: i % 3 === 0 ? "#e2a72e" : i % 3 === 1 ? "#ca4c3d" : "#f1f0ea" }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-ivory" />
      </div>

      {/* ── Words ── */}
      <Container className="ty-text relative -mt-10 text-center">
        <p className="ty-fade eyebrow">With gratitude</p>
        <h2 id="thanks-heading" className="script-heading mt-4 text-script-xl">
          <span className="write-in inline-block px-2">Thank You</span>
        </h2>
        <p className="ty-fade mx-auto mt-4 max-w-[21rem] text-[1.15rem] leading-snug text-ink [text-wrap:balance] md:max-w-[30rem] md:text-xl">{thankYou.message}</p>

        <div className="ty-fade mt-8 flex justify-center">
          <Ornament className="text-gold" />
        </div>

        <p className="mt-6 font-script text-[clamp(2.4rem,11vw,4rem)] leading-none text-accent">
          <span className="write-in inline-block px-2">
            {first.name} &amp; {second.name}
          </span>
        </p>

        {thankYou.quote && <p className="ty-fade mx-auto mt-6 max-w-[19rem] italic text-ink-soft md:max-w-[26rem]">“{thankYou.quote}”</p>}
        {wedding.blessing && <p className="ty-fade mt-6 text-[0.8rem] tracking-[0.32em] text-ink-soft">{wedding.blessing}</p>}
      </Container>
    </section>
  );
}
