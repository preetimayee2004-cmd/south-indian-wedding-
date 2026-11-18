import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Leaf, rand } from "@/components/scene/Decor";
import { ScenePicture, showsWide } from "@/components/scene/ScenePicture";
import { ScrollCue } from "@/components/ui/ScrollCue";

/** The exact sky colour of temple-hero.webp. */
export const TEMPLE_SKY = "#004DB7";
const LEAVES = 7;
/** How much of the portrait picture's top shows at the start: finials + roof top. */
const PEEK = 0.18;

/** Clouds, all above the temple and inside the top 25% of the screen: [left vw, top svh, width vw, height svh, drift vw]. */
const CLOUDS: [number, number, number, number, number][] = [
  [-6, 2, 34, 7, 14],
  [62, 4, 30, 6, -11],
  [26, 11, 26, 5.5, 8],
  [-12, 15, 30, 6, 18],
  [74, 16, 28, 5.5, -15],
];

/**
 * Scene 1 — Hero + temple (pinned 250vh, scrub 1).
 * The temple always spans the full screen width (never narrower). It starts
 * pushed down so only the golden finials and roof top show at the bottom,
 * then rises with the scroll while easing from 1 to 1.15 (about its centre),
 * so the camera travels down the tower to the stone base. Names rise at half
 * the temple's speed and fade in the first 30%. Clouds drift above the temple
 * in the top quarter of the screen; leaves fall in the last 40%. The
 * invitation arch then rises over it on a scalloped edge (`tail`).
 */
export function TempleHeroScene({ tail = 1 }: { tail?: number }) {
  const { couple, wedding, media } = useWedding();
  const { guestName } = useGuest();
  const revealed = useRevealed();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const d = new Date(wedding.dateISO);
  const wide = media.invitationWide;
  const dateLine = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(d);

  const copy = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const temple = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);
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
    const peek = () => (showsWide(wide?.src) ? wide!.peek : PEEK);
    const END_SCALE = 1.15;
    // scale is about the centre: at 1 the visual top is y; at 1.15 the visual bottom is y + H(1 + 1.15)/2
    const yStart = () => vh() - peek() * H();
    const yEnd = () => vh() - ((1 + END_SCALE) / 2) * H();
    const travel = () => yStart() - yEnd();
    const T = 2.5;

    tl.fromTo(temple.current, { scale: 1, y: yStart }, { scale: END_SCALE, y: yEnd, duration: T, ease: "power1.inOut" }, 0)
      // names: half the temple's speed, gone by 30%
      .to(copy.current, { y: () => -travel() / 2, duration: T, ease: "power1.inOut" }, 0)
      .to(copy.current, { opacity: 0, duration: T * 0.3, ease: "power1.in" }, 0)
      .to(cue.current, { autoAlpha: 0, duration: 0.15 }, 0);

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
      {/* the temple: full screen width, height from the picture; centre-origin scale 1 → 1.15 */}
      <ScenePicture
        ref={temple}
        src={media.invitation}
        ratio="3 / 4"
        wide={wide?.src}
        alt="A colourful gopuram against a deep blue sky, with a flowering tree in front"
        className="origin-center"
        eager
      />

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

      {/* names and date, centred on the sky */}
      <div ref={copy} data-layer className="absolute inset-0 z-10 flex items-center justify-center px-gutter pb-[14svh]">
        <div ref={lines} className="flex flex-col items-center text-center text-white [text-shadow:0_2px_18px_rgb(0_30_90/0.55)]">
          {wedding.blessing && <p className="text-[0.8rem] tracking-[0.32em]">{wedding.blessing}</p>}
          <p className="mt-3 font-script text-[clamp(1.9rem,min(8.5vw,5svh),2.8rem)] leading-tight">Dear {guestName},</p>
          <p className="mt-1.5 max-w-[19rem] text-[1rem] italic leading-snug">{wedding.invitationLine}</p>
          <h1 id="couple-names" className="mt-3 font-script font-normal leading-[0.95]">
            <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{first.name}</span>
            <span className="block text-[clamp(1.5rem,min(6.5vw,4svh),2.6rem)]">&amp;</span>
            <span className="block text-[clamp(3rem,min(14vw,9svh),6rem)]">{second.name}</span>
          </h1>
          <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.3em]">
            {dateLine} · {wedding.city.split(",")[0]}
          </p>
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

      <ScrollCue ref={cue} href="#invite-heading" className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 -translate-x-1/2" />
    </Scene>
  );
}
