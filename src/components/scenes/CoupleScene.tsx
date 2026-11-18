import { useRef, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Petal, rand } from "@/components/scene/Decor";
import { art2x } from "@/lib/art";

/** The picture's sky (top) and floor (bottom) colours, so its edges vanish. */
export const COUPLE_SKY = "#C5E4EA";
export const COUPLE_FLOOR = "#F9E6BD";
export const COUPLE_BG = `linear-gradient(${COUPLE_SKY}, ${COUPLE_FLOOR})`;
export const COUPLE_RATIO = "1116 / 2000";
/** Lamp flames in couple-scene.webp, [x%, y%]. */
const LAMPS: [number, number][] = [
  [15, 70],
  [85, 70.5],
];
export const SIDE_FADE = "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)";

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
 * Scene 2 — the couple (pinned 250vh, scrub 1). Revealed as the invitation's
 * parchment lifts away. The camera starts on the sky and the three gopurams,
 * moves down to the couple and holds there for the middle 30% while their
 * names appear one line at a time, then ends on the lamps and lotus flowers.
 * The picture is sized at its final zoom; scale goes 0.6 → 1, never above.
 * Clouds drift, petals fall at three speeds, the lamps glow. Finally the cream
 * floor colour fills the screen and becomes the next section's background.
 */
export function CoupleScene() {
  const { couple, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const pic = useRef<HTMLDivElement>(null);
  const names = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const clouds = useRef<(HTMLDivElement | null)[]>([]);
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  const build: Build = (tl) => {
    const vh = () => window.innerHeight;
    const H = () => pic.current!.offsetHeight; // final (scale 1) height
    const yStart = () => 0.03 * vh();
    const yCouple = () => 0.6 * vh() - 0.64 * 0.82 * H(); // couple centred a little low, names above
    const yEnd = () => vh() - H(); // lamps and lotus at the bottom edge

    tl.fromTo(pic.current, { xPercent: -50, scale: 0.6, y: yStart }, { xPercent: -50, scale: 0.82, y: yCouple, duration: 0.875, ease: "power2.inOut" }, 0)
      // hold on the couple (35% → 65%) while their names appear
      .from(names.current!.querySelectorAll("[data-name]"), { opacity: 0, y: 14, duration: 0.18, stagger: 0.16, ease: "power2.out" }, 0.95)
      .to(pic.current, { scale: 1, y: yEnd, duration: 0.875, ease: "power2.inOut" }, 1.625)
      .to(names.current, { opacity: 0, y: () => -0.15 * vh(), duration: 0.4, ease: "power1.in" }, 1.625);

    clouds.current.forEach((c, i) => tl.to(c, { xPercent: i % 2 ? -18 : 22, duration: 2.5 }, 0));
    addPetals(tl, petals.current, 0, 2.5);

    // the cream floor rises to fill the screen
    tl.fromTo(floor.current, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power2.in" }, 2.25);
  };

  const glow = (x: number, y: number): CSSProperties => ({
    left: `${x}%`,
    top: `${y}%`,
    width: "17%",
    aspectRatio: "1",
    transform: "translate(-50%, -50%)",
    background: "radial-gradient(circle, rgb(255 210 110 / 0.75) 0%, rgb(255 170 60 / 0.3) 38%, transparent 70%)",
  });

  return (
    <Scene id="couple" labelledBy="couple-heading" style={{ background: COUPLE_BG }} build={build}>
      {/* the picture, sized at final zoom; GSAP scales it 0.6 → 1 about its top centre */}
      <div
        ref={pic}
        data-layer
        className="absolute left-1/2 top-0 origin-top"
        style={{ height: "clamp(115svh, 251vw, 140svh)", aspectRatio: COUPLE_RATIO, maskImage: SIDE_FADE, WebkitMaskImage: SIDE_FADE }}
      >
        <img
          {...art2x(media.couple)}
          alt={`${first.name} and ${second.name} exchanging garlands before the temple, with lamps and lotus flowers`}
          decoding="async"
          className="h-full w-full object-cover"
          draggable={false}
        />
        {/* drifting clouds over the sky */}
        <Cloud ref={(el) => void (clouds.current[0] = el)} className="left-[2%] top-[2.5%] h-[5%] w-[34%]" opacity={0.75} />
        <Cloud ref={(el) => void (clouds.current[1] = el)} className="right-[0%] top-[8%] h-[4.5%] w-[30%]" opacity={0.7} />
        <Cloud ref={(el) => void (clouds.current[2] = el)} className="left-[30%] top-[13%] h-[3.5%] w-[24%]" opacity={0.55} />
        {/* warm glow over each lamp's flames */}
        {LAMPS.map(([x, y], i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute rounded-full mix-blend-screen motion-safe:animate-[flicker_2.8s_ease-in-out_infinite]"
            style={{ ...glow(x, y), animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </div>

      <Petals refs={petals} />

      {/* names, above the couple during the pause */}
      <div ref={names} data-layer className="absolute inset-x-0 top-[max(1rem,3.5svh)] z-30 mx-auto max-w-[26rem] py-3 text-center [text-shadow:0_1px_12px_rgb(255_250_235/0.95)]" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgb(252 244 222 / 0.88), rgb(252 244 222 / 0.55) 55%, transparent 75%)" }}>
        <p data-name className="text-[0.75rem] font-bold uppercase tracking-[0.38em] text-maroon">The couple</p>
        <h2 id="couple-heading" className="mt-1 font-script font-normal leading-[0.95] text-accent">
          <span data-name className="block text-[clamp(2.6rem,12vw,4.6rem)]">{first.name}</span>
          <span data-name className="block text-[clamp(1.5rem,7vw,2.6rem)] text-gold">&amp;</span>
          <span data-name className="block text-[clamp(2.6rem,12vw,4.6rem)]">{second.name}</span>
        </h2>
      </div>

      {/* the floor colour that fills the screen at the end */}
      <div ref={floor} data-layer className="absolute inset-0 z-40 origin-bottom" style={{ backgroundColor: COUPLE_FLOOR, transform: "scaleY(0)" }} />
    </Scene>
  );
}
