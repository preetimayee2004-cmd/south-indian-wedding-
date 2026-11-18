import { useRef, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Petal, rand } from "@/components/scene/Decor";
import { gsap } from "@/lib/gsap";
import { hasArt } from "@/lib/art";
import { ScenePicture } from "@/components/scene/ScenePicture";
import { TEMPLE_SKY } from "./TempleHeroScene";

/** The picture's sky (top) and floor (bottom) colours, so its edges vanish. */
export const COUPLE_SKY = "#C5E4EA";
export const COUPLE_FLOOR = "#F9E6BD";
export const COUPLE_BG = `linear-gradient(${COUPLE_SKY}, ${COUPLE_FLOOR})`;
/** Tops of the heads, and the faces + garland, as fractions of the picture height. */
const HEADS = 0.31;
const FACES = 0.47;
/** Width of the portrait picture inside the 16:9 wide one (its centre is kept unchanged). */
const CENTRE = 1116 / 2000 / (16 / 9);
/** Lamp flames in couple-scene.webp, [x%, y%]. */
const LAMPS: [number, number][] = [
  [15, 70],
  [85, 70.5],
];

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
 * parchment lifts away. The picture always spans the full screen width (the
 * landscape version above 900px when present), at least tall enough to fill
 * the screen with room to travel. The camera starts on the sky and gopurams,
 * travels down to the couple, holds on their faces and garland for the middle
 * 30%, then ends on the lamps and lotus flowers. "The Couple / names" show
 * only at the start, over the sky, and fade out before the couple's heads
 * reach them. Clouds drift, petals fall across the whole width at three
 * speeds, the lamps glow; finally the hero's cobalt fills the screen and
 * becomes the next section's background.
 */
export function CoupleScene() {
  const { couple, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const wideOk = hasArt(media.coupleWide);

  const pic = useRef<HTMLDivElement>(null);
  const names = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const clouds = useRef<(HTMLDivElement | null)[]>([]);
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  const build: Build = (tl) => {
    const vh = () => window.innerHeight;
    const H = () => pic.current!.offsetHeight; // full-width height
    // never narrower than the screen; tall enough to fill it with some travel
    const S = () => Math.max(1, (1.15 * vh()) / H());
    const tall = () => S() * H();
    const yEnd = () => vh() - tall(); // lamps and lotus at the bottom edge
    const yCouple = () => Math.min(0, Math.max(yEnd(), 0.5 * vh() - FACES * tall())); // faces + garland centred

    // where the tops of the heads are on screen, to keep the names clear of them
    // names show only at the start: gone by 40% of the way to the couple,
    // and sooner if the heads get within reach of them (opacity only)
    const fadeNames = (progress = 0) => {
      const el = names.current!;
      const headY = (gsap.getProperty(pic.current, "y") as number) + HEADS * tall();
      const clear = headY - (el.offsetTop + el.offsetHeight) - 0.08 * vh();
      const byHeads = clear / (0.1 * vh());
      const byTime = 1 - (progress - 0.05) / 0.35;
      el.style.opacity = String(Math.max(0, Math.min(1, byHeads, byTime)));
    };

    tl.fromTo(
      pic.current,
      { scale: S, y: 0, transformOrigin: "50% 0%" },
      {
        scale: S,
        y: yCouple,
        duration: 0.875,
        ease: "power2.inOut",
        onUpdate(this: gsap.core.Tween) {
          fadeNames(this.progress());
        },
      },
      0,
    )
      // hold on the couple: 35% → 65%
      .to(pic.current, { y: yEnd, duration: 0.875, ease: "power2.inOut" }, 1.625);
    fadeNames(0);

    clouds.current.forEach((c, i) => tl.to(c, { xPercent: i % 2 ? -18 : 22, duration: 2.5 }, 0));
    addPetals(tl, petals.current, 0, 2.5);

    // the cream floor rises to fill the screen
    tl.fromTo(floor.current, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power2.in" }, 2.25);
  };

  const glow = (x: number, y: number, w: number): CSSProperties => ({
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    aspectRatio: "1",
    transform: "translate(-50%, -50%)",
    background: "radial-gradient(circle, rgb(255 210 110 / 0.75) 0%, rgb(255 170 60 / 0.3) 38%, transparent 70%)",
  });
  const glows = (set: "narrow" | "wide") =>
    LAMPS.map(([x, y], i) => {
      // the wide picture keeps the portrait one, unchanged, in its centre third
      const [gx, gw] = set === "wide" ? [50 + (x - 50) * CENTRE, 17 * CENTRE] : [x, 17];
      return (
        <span
          key={`${set}${i}`}
          aria-hidden
          className={`pointer-events-none absolute rounded-full mix-blend-screen motion-safe:animate-[flicker_2.8s_ease-in-out_infinite] ${
            wideOk ? (set === "wide" ? "hidden min-[901px]:block" : "min-[901px]:hidden") : ""
          }`}
          style={{ ...glow(gx, y, gw), animationDelay: `${i * 0.6}s` }}
        />
      );
    });

  return (
    <Scene id="couple" labelledBy="couple-heading" style={{ background: COUPLE_BG }} build={build}>
      <ScenePicture
        ref={pic}
        src={media.couple}
        ratio="1116 / 2000"
        wide={media.coupleWide}
        alt={`${first.name} and ${second.name} exchanging garlands before the temple, with lamps and lotus flowers`}
      >
        {/* drifting clouds over the sky, and the lamp glow — both ride along with the picture */}
        <Cloud ref={(el) => void (clouds.current[0] = el)} className="left-[2%] top-[2.5%] h-[5%] w-[34%]" opacity={0.75} />
        <Cloud ref={(el) => void (clouds.current[1] = el)} className="right-[0%] top-[8%] h-[4.5%] w-[30%]" opacity={0.7} />
        <Cloud ref={(el) => void (clouds.current[2] = el)} className="left-[30%] top-[13%] h-[3.5%] w-[24%]" opacity={0.55} />
        {glows("narrow")}
        {wideOk && glows("wide")}
      </ScenePicture>
      <Petals refs={petals} />

      {/* names: only at the start, over the sky; faded out before the heads reach them */}
      <div ref={names} className="pointer-events-none absolute inset-x-0 top-[max(1rem,4svh)] z-30 px-gutter text-center [text-shadow:0_0_24px_#FFF8E7,0_0_10px_#FFF8E7]">
        <p className="text-[0.75rem] font-bold uppercase tracking-[0.38em] text-maroon">The Couple</p>
        <h2 id="couple-heading" className="mt-1 font-script text-[clamp(2.4rem,10vw,4.6rem)] font-normal leading-none text-accent">
          {first.name} <span className="text-gold">&amp;</span> {second.name}
        </h2>
      </div>

      {/* the floor colour that fills the screen at the end */}
      <div ref={floor} data-layer className="absolute inset-0 z-40 origin-bottom" style={{ backgroundColor: TEMPLE_SKY, transform: "scaleY(0)" }} />
    </Scene>
  );
}
