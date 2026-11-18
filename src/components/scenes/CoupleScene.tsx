import { useRef, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Petal, rand } from "@/components/scene/Decor";
import { naturalSize, srcSetOf, artProps } from "@/lib/art";

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

/** Breakpoint between the portrait (below) and landscape (at and above) couple picture. */
const WIDE = "(min-width: 900px)";
/** Scene length after the first screen: 2.2 screens → a 320vh pinned track. */
const P1 = 0.6; // glide in from below and ease to rest
const P2 = 0.8; // hold: slow 1 → 1.1, petals
const P3 = 0.8; // move on while the next section rises over it

/**
 * The couple — a pinned scene (320vh, scrub 1.5).
 *  1. The picture glides in from below and eases to rest, the couple centred.
 *  2. It stays put, slowly scaling 1 → 1.1, while petals fall.
 *  3. It moves on and the gallery rises over it on a soft fade into the sky
 *     (no hard horizontal line).
 * Portrait picture under 900px, landscape at and above (one <picture>); each
 * is capped at its natural pixel size, centred on the solid sky with softly
 * fading edges.
 */
export function CoupleScene() {
  const { couple, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const portrait = media.couplePortrait ?? media.couple;
  const land = naturalSize(media.couple) ?? { w: 1376, h: 768 };
  const port = naturalSize(portrait) ?? { w: 768, h: 1376 };

  const slide = useRef<HTMLDivElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  const build: Build = (tl) => {
    // 1 — from below the screen to rest
    tl.fromTo(slide.current, { yPercent: 100 }, { yPercent: 0, duration: P1, ease: "power3.out" }, 0)
      // 2 — held, slowly growing; petals fall
      .fromTo(zoom.current, { scale: 1 }, { scale: 1.1, duration: P2 + P3, ease: "none" }, P1)
      // 3 — moves on upward while the next section rises over it
      .to(slide.current, { yPercent: -14, duration: P3, ease: "power1.in" }, P1 + P2);
    addPetals(tl, petals.current, P1 * 0.6, P2 + P3);
  };

  return (
    <Scene id="couple" labelledBy="couple-heading" className="cobalt" build={build} tail={0} scrub={1.5}>
      {/* the picture's box: portrait fills a phone screen; landscape ≤ its natural size, centred */}
      <div ref={slide} data-layer className="absolute inset-0 flex items-center justify-center">
        <div
          className="couple-pic relative overflow-hidden"
          style={{
            ["--pw" as string]: `${port.w}px`,
            ["--ph" as string]: `${port.h}px`,
            ["--lw" as string]: `${land.w}px`,
            ["--lar" as string]: `${land.w} / ${land.h}`,
          }}
        >
          <div ref={zoom} data-layer className="h-full w-full">
            <picture>
              <source media={WIDE} srcSet={srcSetOf(media.couple)} sizes={`min(100vw, ${land.w}px)`} />
              <img
                {...artProps(portrait, "100vw")}
                alt={`${first.name} and ${second.name} exchanging garlands before the temples, with lamps and lotus flowers`}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
                style={{ objectPosition: "50% 58%" }}
                draggable={false}
              />
            </picture>
          </div>
        </div>
      </div>
      <Petals refs={petals} />
      {/* the picture speaks for itself (named for screen readers) */}
      <h2 id="couple-heading" className="sr-only">
        {first.name} &amp; {second.name}
      </h2>
    </Scene>
  );
}
