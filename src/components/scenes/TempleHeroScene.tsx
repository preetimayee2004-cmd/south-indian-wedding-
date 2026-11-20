import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Leaf, rand } from "@/components/scene/Decor";
import { TempleStage } from "./hero/TempleStage";

/** The solid sky colour sampled from the top of temple-hero.webp (the hero's only sky). */
export const TEMPLE_SKY = "#0061C2";
const LEAVES = 7;
/** How much of the portrait picture's top shows at the start: finials + roof top. */
const PEEK = 0.18;

/** Flat clouds, all in the band above the text (which starts at 14% of the screen): [left vw, top svh, width vw, height svh, drift vw]. */
const CLOUDS: [number, number, number, number, number][] = [
  [-6, 1.5, 30, 5.5, 12],
  [64, 1, 28, 5, -10],
  [30, 6.5, 22, 4.5, 7],
  [-14, 7, 24, 4.5, 14],
  [80, 6.5, 24, 4.5, -12],
];
/** The temple may peek into the bottom 22% of the screen at the start, no more. */
const MAX_PEEK = 0.22;

/**
 * Scene 1 — Hero + temple, on a sticky track.
 * The temple always spans the full screen width. It starts pushed down so
 * only the golden finials and roof top show, in the bottom 22% of the screen,
 * then rises exactly with the scroll (1:1) until its stone base reaches the
 * bottom edge. The text block (14%–68% of the screen) moves up at half the
 * temple's speed and fades out before the temple reaches it. Flat clouds
 * drift in the band above the text, on a solid sky; leaves fall in the last 40%. The
 * invitation arch then rises over it on a scalloped edge (`tail`).
 */
export function TempleHeroScene({ tail = 1 }: { tail?: number }) {
  const { couple, wedding } = useWedding();
  const { guestName } = useGuest();
  const revealed = useRevealed();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;

  const copy = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const temple = useRef<HTMLDivElement>(null);
  const clouds = useRef<(HTMLDivElement | null)[]>([]);
  const leaves = useRef<(HTMLDivElement | null)[]>([]);

  // Entrance once the envelope hands over: the words settle onto the sky.
  useLayoutEffect(() => {
    const els = lines.current?.children;
    if (!els) return;
    if (!revealed) {
      gsap.set(els, { autoAlpha: 0, y: 22 });
      return;
    }
    const tw = gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.14, delay: 0.2 });
    return () => void tw.kill();
  }, [revealed]);

  const build: Build = (tl) => {
    const vh = () => window.innerHeight;
    const vw = () => window.innerWidth;
    const H = () => temple.current!.offsetHeight; // full-width height at scale 1
    const peek = () => PEEK;
    const yStart = () => vh() - Math.min(peek() * H(), MAX_PEEK * vh()); // only the finials and roof top show, in the bottom 22% at most
    // the stone base at the bottom edge, 3px past it so no sliver of the blue sky can show beneath
    const yEnd = () => Math.min(yStart(), vh() - H() + 3);
    const travel = () => yStart() - yEnd();
    // the temple rises exactly with the scroll (1:1), then holds while the leaves fall
    const RISE = Math.max(0.4, travel() / vh());
    const T = Math.max(1.6, RISE + 0.6);

    // the text stays where it is; the temple rises over it and covers it (it sits behind the temple)
    tl.fromTo(temple.current, { y: yStart }, { y: yEnd, duration: RISE, ease: "none" }, 0)
      .to({}, { duration: T - RISE }, RISE);

    // clouds drift sideways only, each at its own speed — they stay in the top quarter
    clouds.current.forEach((c, i) => tl.to(c, { x: () => (CLOUDS[i][4] / 100) * vw(), duration: T }, 0));

    // leaves drift down across the screen in the last 40%
    leaves.current.forEach((l, i) => {
      const x0 = rand(i, 3);
      const drift = (rand(i, 7) - 0.5) * 0.5;
      tl.fromTo(
        l,
        { x: () => x0 * vw(), y: () => -0.08 * vh(), rotate: rand(i, 5) * 360, autoAlpha: 1 },
        { x: () => (x0 + drift) * vw(), y: () => 1.08 * vh(), rotate: `+=${300 + rand(i, 9) * 300}`, duration: 0.55 + rand(i, 11) * 0.35, ease: "none" },
        T * 0.6 + (i / LEAVES) * (T * 0.4 - 0.7),
      );
    });
  };

  return (
    <Scene id="invitation-hero" labelledBy="couple-names" style={{ backgroundColor: TEMPLE_SKY }} build={build} tail={tail}>
      {/* the temple: full screen width, height from the picture; rises 1:1 with the scroll */}
      <TempleStage ref={temple} className="z-[2]" eager />

      {/* clouds: above the temple, inside the top 25% of the screen */}
      {CLOUDS.map(([left, top, w, h], i) => (
        <Cloud
          key={i}
          ref={(el) => void (clouds.current[i] = el)}
          className="z-[5]"
          style={{ left: `${left}vw`, top: `${top}svh`, width: `${w}vw`, height: `${h}svh` }}
          opacity={0.92 - (i % 3) * 0.08}
        />
      ))}

      {/* the text in the upper part of the screen: from 14% down to 68% at most, clear of the temple and the clouds */}
      <div ref={copy} data-layer className="hero-copy absolute inset-x-0 z-[1] flex justify-center px-gutter">
        <div ref={lines} className="flex max-w-full flex-col items-center text-center text-white">
          {wedding.invocation && <p className="hero-invocation">{wedding.invocation}</p>}
          <h1 id="couple-names" className="hero-names" data-fit=".hero-copy">
            <span className="block">{first.name}</span>
            <span className="hero-weds">
              <span aria-hidden className="hero-weds-line" />
              weds
              <span aria-hidden className="hero-weds-line" />
            </span>
            <span className="block">{second.name}</span>
          </h1>
          <p className="hero-married">are getting married</p>
          <p className="hero-dear" data-fit=".hero-copy">
            <span className="whitespace-nowrap">Dear {guestName},</span> <span className="whitespace-nowrap">you are invited</span>
          </p>
          {/* plain bold "scroll down" (not clickable) with a hand that swipes up, so anyone knows to scroll */}
          <div className="hero-scroll" aria-hidden>
            <svg viewBox="0 0 40 48" className="hero-hand">
              <path
                d="M15 22V8a3 3 0 0 1 6 0v11l1-1a3 3 0 0 1 5 2v1a3 3 0 0 1 5 1v1a3 3 0 0 1 5 1v8c0 7-5 12-12 12h-2c-4 0-7-2-9-5l-6-9a3 3 0 0 1 4-4l3 3Z"
                fill="#fbf2dc"
                stroke="#5e1220"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            Scroll down
            <svg viewBox="0 0 24 22" className="hero-scroll-arrows">
              <path d="M4 3l8 7 8-7M4 12l8 7 8-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* leaves (positioned by GSAP) */}
      {Array.from({ length: LEAVES }, (_, i) => (
        <Leaf
          key={i}
          ref={(el) => void (leaves.current[i] = el)}
          tone={i}
          className="invisible z-20"
          style={{ width: `${14 + rand(i, 2) * 10}px`, height: `${20 + rand(i, 2) * 14}px` }}
        />
      ))}

    </Scene>
  );
}
