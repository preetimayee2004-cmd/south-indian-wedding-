import { useLayoutEffect, useRef, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Petal, rand } from "@/components/scene/Decor";
import { gsap } from "@/lib/gsap";
import { SCRUB } from "@/lib/smooth";
import { TEMPLE_SKY } from "./TempleHeroScene";

/** couple-scene.webp is landscape. */
const RATIO = 1376 / 768;
/** Where the couple stands across the picture (fraction of its width). */
const COUPLE_X = 0.5;
/** Lamp flames in couple-scene.webp, [x%, y%]. */
const LAMPS: [number, number][] = [
  [9.5, 69.5],
  [90.5, 69.5],
];
/** How far the picture lags behind the page while the section comes up (fraction of the screen). */
const ARRIVE = 0.6;

/** Three groups of petals falling at different speeds: [count, duration, spread]. */
const PETAL_GROUPS: [number, number, number][] = [
  [5, 2.5, 0], // slow: one long fall over the whole scene
  [5, 1.2, 1.3], // medium
  [6, 0.6, 1.9], // fast
];

/** Falling petals, shared with the thank-you scene. Positioned by GSAP. */
export function Petals({ refs, z = "z-20" }: { refs: MutableRefObject<(HTMLDivElement | null)[]>; z?: string }) {
  let k = 0;
  return (
    <>
      {PETAL_GROUPS.map(([n], g) =>
        Array.from({ length: n }, () => {
          const idx = k++;
          const size = 9 + rand(idx, 4) * 8 - g * 1.5;
          return <Petal key={idx} ref={(el) => void (refs.current[idx] = el)} tone={idx} className={`invisible ${z}`} style={{ width: size, height: size * 1.3 }} />;
        }),
      )}
    </>
  );
}

/** Adds the petal falls to a timeline, spread over `span` screens from `start`. */
export function addPetals(tl: Parameters<Build>[0], petals: (HTMLDivElement | null)[], start = 0, span = 2.5) {
  const vw = () => window.innerWidth;
  const vh = () => window.innerHeight;
  let k = 0;
  const scale = span / 2.5;
  PETAL_GROUPS.forEach(([n, dur, spread]) => {
    for (let i = 0; i < n; i++, k++) {
      const el = petals[k];
      if (!el) continue;
      const x0 = rand(k, 13);
      const drift = (rand(k, 17) - 0.5) * 0.3;
      tl.fromTo(
        el,
        { x: () => x0 * vw(), y: () => -0.06 * vh(), rotate: rand(k, 19) * 360, autoAlpha: 1 },
        { x: () => (x0 + drift) * vw(), y: () => 1.06 * vh(), rotate: `+=${240 + rand(k, 23) * 360}`, duration: dur * scale, ease: "none" },
        start + (spread ? (i / n) * spread * scale : 0),
      );
    }
  });
}

/**
 * Scene 2 — the couple, with the whole picture (temples, banana trees, lamps),
 * framed on the couple. As in the reference invitation, the section rises over
 * the invitation like the next page while the picture moves up more slowly
 * than the page — so the couple glide slowly down and come to rest the moment
 * the scene fills the screen. It then holds a moment: clouds drift, petals
 * fall, the lamps glow. Finally the cobalt fills the screen for the family.
 */
export function CoupleScene() {
  const { couple, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const glide = useRef<HTMLDivElement>(null);
  const pic = useRef<HTMLDivElement>(null);
  const names = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const clouds = useRef<(HTMLDivElement | null)[]>([]);
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  // arrival: while the section comes up, the picture lags behind the page and glides down into place
  useLayoutEffect(() => {
    const section = glide.current?.closest("section");
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        glide.current,
        { y: () => -ARRIVE * window.innerHeight },
        { y: 0, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: SCRUB, invalidateOnRefresh: true } },
      );
    }, section);
    return () => ctx.revert();
  }, []);

  const build: Build = (tl) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const W = pic.current!.offsetWidth;
    const H = pic.current!.offsetHeight;
    // framed on the couple, the floor at the bottom edge
    gsap.set(pic.current, { x: Math.min(0, Math.max(vw - W, vw / 2 - COUPLE_X * W)), y: vh - H });
    const T = 1.4;

    // at rest for a moment
    tl.to({}, { duration: T });

    clouds.current.forEach((c, i) => tl.to(c, { xPercent: i % 2 ? -22 : 26, duration: T }, 0));
    addPetals(tl, petals.current, 0, T);

    // the hero's cobalt rises to fill the screen
    tl.fromTo(floor.current, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power2.in" }, T - 0.2);
  };

  const glow = (x: number, y: number): CSSProperties => ({
    left: `${x}%`,
    top: `${y}%`,
    width: "7%",
    aspectRatio: "1",
    transform: "translate(-50%, -50%)",
    background: "radial-gradient(circle, rgb(255 210 110 / 0.8) 0%, rgb(255 170 60 / 0.32) 38%, transparent 70%)",
  });

  return (
    <Scene
      id="couple"
      labelledBy="couple-heading"
      className="cobalt"
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "#004DB7" }} />}
    >
      <div ref={glide} data-layer className="absolute inset-0">
        {/* the picture: fills the screen height (never narrower than the screen); the camera pans across it */}
        <div
          ref={pic}
          data-layer
          className="absolute left-0 top-0"
          style={{ height: `max(106svh, calc(100vw / ${RATIO.toFixed(4)}))`, aspectRatio: `${RATIO}` }}
        >
          <img
            src={media.couple.replace(/.webp$/, "@2x.webp")}
            alt={`${first.name} and ${second.name} exchanging garlands before the temples, with lamps and lotus flowers`}
            decoding="async"
            className="block h-full w-full object-cover"
            draggable={false}
          />
          {/* drifting clouds over the sky, and the lamp glow — both ride along with the picture */}
          <Cloud ref={(el) => void (clouds.current[0] = el)} className="left-[14%] top-[2%] h-[9%] w-[12%]" opacity={0.7} />
          <Cloud ref={(el) => void (clouds.current[1] = el)} className="left-[46%] top-[1%] h-[8%] w-[10%]" opacity={0.6} />
          <Cloud ref={(el) => void (clouds.current[2] = el)} className="left-[70%] top-[5%] h-[8%] w-[11%]" opacity={0.65} />
          {LAMPS.map(([x, y], i) => (
            <span
              key={i}
              aria-hidden
              className="pointer-events-none absolute rounded-full mix-blend-screen motion-safe:animate-[flicker_2.8s_ease-in-out_infinite]"
              style={{ ...glow(x, y), animationDelay: `${i * 0.6}s` }}
            />
          ))}
        </div>
      </div>

      <Petals refs={petals} />

      {/* as in the reference: the picture speaks for itself (named for screen readers) */}
      <div ref={names} className="sr-only">
        <h2 id="couple-heading">
          {first.name} &amp; {second.name}
        </h2>
      </div>

      {/* the colour that fills the screen at the end */}
      <div ref={floor} data-layer className="absolute inset-0 z-40 origin-bottom" style={{ backgroundColor: TEMPLE_SKY, transform: "scaleY(0)" }} />
    </Scene>
  );
}
