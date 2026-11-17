import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { desktopArt } from "../art";

/**
 * Desktop scene 1 — names on the open sky. The scene holds while you scroll
 * and the camera descends the art (sky → gopuram), the names lifting away,
 * before the journey dissolves into the invitation.
 */
export function HeroScene() {
  const config = useWedding();
  const { couple, wedding } = config;
  const art = desktopArt(config, "hero");
  const revealed = useRevealed();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.dateISO));

  // Camera descent, scrubbed by scroll while the scene is held.
  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const travel = () => Math.max(0, img.current!.offsetHeight - el.offsetHeight);
      const start = () => -travel() * (art.focus ?? 0.3);
      if (reduced) {
        gsap.set(img.current, { y: start });
        return;
      }
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "+=130%", pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
        })
        .fromTo(img.current, { y: start, scale: 1 }, { y: () => -travel(), scale: 1.06, transformOrigin: "50% 100%", ease: "none", duration: 1 }, 0)
        .to(words.current, { yPercent: -60, autoAlpha: 0, ease: "power1.in", duration: 0.45 }, 0.05)
        .to(cue.current, { autoAlpha: 0, duration: 0.1 }, 0);
    }, el);
    return () => ctx.revert();
  }, [reduced, art.focus]);

  // Names settle in once the opening hands over.
  useLayoutEffect(() => {
    if (reduced || !words.current) return;
    const lines = words.current.children;
    if (!revealed) {
      gsap.set(lines, { autoAlpha: 0, y: 26 });
      return;
    }
    const t = gsap.to(lines, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.16, ease: "power3.out", delay: 0.2 });
    return () => void t.kill();
  }, [revealed, reduced]);

  return (
    <section ref={root} aria-labelledby="couple-names" className="relative h-[100svh] overflow-hidden bg-[#5f9fdc]">
      <img
        ref={img}
        src={art.src}
        alt="A carved gopuram rising into a clear blue sky"
        fetchPriority="high"
        className="absolute left-0 top-0 w-full object-cover"
        style={{ aspectRatio: String(art.ratio), minHeight: "112%" }}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[rgb(28_62_112/0.28)] to-transparent" />

      <div ref={words} className="absolute inset-x-0 top-[16vh] text-center text-white [text-shadow:0_3px_24px_rgb(24_52_96/0.45)]">
        {wedding.blessing && <p className="text-[0.95rem] tracking-[0.4em]">{wedding.blessing}</p>}
        <h1 id="couple-names" className="mt-5 font-script font-normal leading-[0.92]">
          <span className="block text-[clamp(5rem,9vw,9rem)]">{first.name}</span>
          <span className="block text-[clamp(2.4rem,4vw,4rem)] opacity-90">&amp;</span>
          <span className="block text-[clamp(5rem,9vw,9rem)]">{second.name}</span>
        </h1>
        <p className="mt-7 text-[0.85rem] uppercase tracking-[0.42em] opacity-95">
          {date} · {wedding.city.split(",")[0]}
        </p>
      </div>

      <div ref={cue} className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/90">
        <span className="text-[0.66rem] uppercase tracking-[0.36em]">Scroll</span>
        <span className="block h-8 w-px overflow-hidden bg-white/30">
          <span className="block h-full w-full animate-[cue_2.2s_ease-in-out_infinite] bg-white motion-reduce:animate-none" />
        </span>
      </div>
    </section>
  );
}
