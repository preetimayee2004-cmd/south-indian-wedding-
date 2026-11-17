import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { desktopArt } from "../art";
import { artProps } from "@/lib/art";

/**
 * Desktop scene 1 — names and date over the gopuram and open sky. Scrolling
 * holds the scene: the gopuram zooms and rises into the place it holds in the
 * second picture, which dissolves in while the camera moves down to the
 * dancers in the courtyard. Then the journey continues to the invitation.
 */
export function HeroScene() {
  const config = useWedding();
  const { couple, wedding } = config;
  const art = desktopArt(config, "hero");
  const reveal = desktopArt(config, "heroReveal");
  const revealed = useRevealed();
  const reduced = usePrefersReducedMotion();

  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const layerA = useRef<HTMLDivElement>(null);
  const imgA = useRef<HTMLImageElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const words = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(new Date(wedding.dateISO));

  useLayoutEffect(() => {
    const el = root.current!;
    const ctx = gsap.context(() => {
      const travel = () => Math.max(0, frame.current!.offsetHeight - el.offsetHeight);
      const start = () => -travel() * (art.focus ?? 0.4);
      if (reduced) {
        gsap.set(frame.current, { y: start });
        return;
      }
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "+=160%", pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
        })
        .to(words.current, { yPercent: -45, autoAlpha: 0, duration: 0.3, ease: "power1.in" }, 0)
        .to([cue.current, veil.current], { autoAlpha: 0, duration: 0.12 }, 0)
        // the gopuram grows into its place in the second picture…
        .to(layerA.current, { scale: 1.28, yPercent: -56, duration: 0.6, ease: "power2.inOut" }, 0)
        // the dancers picture waits underneath, aligned; the gopuram picture lifts away
        .to(layerA.current, { autoAlpha: 0, duration: 0.3, ease: "none" }, 0.6)
        // …while the camera travels down to the dancers
        .fromTo(frame.current, { y: start }, { y: () => -travel() * (reveal.focus ?? 1), duration: 1, ease: "power1.inOut" }, 0)
        .to({}, { duration: 0.2 });
    }, el);
    return () => ctx.revert();
  }, [reduced, art.focus, reveal.focus]);

  // Names settle in once the opening hands over.
  useLayoutEffect(() => {
    if (reduced || !words.current) return;
    const lines = words.current.children;
    if (!revealed) {
      gsap.set(lines, { autoAlpha: 0, y: 26 });
      gsap.set(imgA.current, { scale: 1.06 });
      return;
    }
    const t = gsap
      .timeline({ delay: 0.2 })
      .to(imgA.current, { scale: 1, duration: 2.4, ease: "power2.out" }, 0)
      .to(lines, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.16, ease: "power3.out" }, 0);
    return () => void t.kill();
  }, [revealed, reduced]);

  return (
    <section ref={root} aria-labelledby="couple-names" className="relative h-[100svh] overflow-hidden bg-[#5f9fdc]">
      {/* Both pictures share one frame so the gopuram can be matched exactly. */}
      <div ref={frame} className="absolute left-0 top-0 w-full" style={{ aspectRatio: String(art.ratio), minHeight: "112%" }}>
        <div ref={layerB} className="absolute inset-0">
          <img {...artProps(reveal.src)} alt="The whole temple, with dancers performing in the courtyard" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div ref={layerA} className="absolute inset-0 origin-top" style={{ maskImage: "linear-gradient(to bottom, #000 94%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 94%, transparent)" }}>
          <img ref={imgA} {...artProps(art.src)} alt="A carved gopuram rising into a clear blue sky" fetchPriority="high" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
      <div ref={veil} className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[rgb(28_62_112/0.28)] to-transparent" />

      <div ref={words} className="absolute inset-x-0 top-[13vh] text-center text-white [text-shadow:0_3px_24px_rgb(24_52_96/0.45)]">
        {wedding.blessing && <p className="text-[0.95rem] tracking-[0.4em]">{wedding.blessing}</p>}
        <h1 id="couple-names" className="mt-5 font-script font-normal leading-[0.92]">
          <span className="block text-[clamp(5rem,min(9vw,14vh),9rem)]">{first.name}</span>
          <span className="block text-[clamp(2.4rem,min(4vw,6vh),4rem)] opacity-90">&amp;</span>
          <span className="block text-[clamp(5rem,min(9vw,14vh),9rem)]">{second.name}</span>
        </h1>
        <p className="mt-6 text-[0.95rem] font-bold uppercase tracking-[0.38em]">
          {date} · {wedding.city.split(",")[0]}
        </p>
      </div>

      <ScrollCue ref={cue} href="#invitation-frame" className="absolute bottom-8 left-1/2 -translate-x-1/2" />
    </section>
  );
}
