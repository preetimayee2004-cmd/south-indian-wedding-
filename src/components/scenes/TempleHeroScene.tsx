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
  [-6, 2, 34, 6.5, 14],
  [62, 3, 30, 6, -11],
  [28, 9, 26, 5, 8],
  [-12, 13, 30, 5.5, 18],
  [74, 14, 28, 5, -15],
];

/**
 * Scene 1 — Hero + temple, on a sticky track.
 * The temple spans the full width on phones; above 900px it is at most 85% of
 * the screen tall, centred on the solid sky. It starts pushed down so only the
 * golden finials and roof top show at the bottom, then rises exactly with the
 * scroll (1:1) until its stone base and tree reach the bottom edge. The names
 * slide down at 0.6× and disappear behind it (no fade). Flat clouds drift
 * behind the temple in the top quarter; leaves fall in the last 40%. For the
 * last `tail` screens everything keeps moving up off the screen while the
 * invitation arch rises in beneath — no horizontal edge ever crosses the temple.
 */
export function TempleHeroScene({ tail = 1 }: { tail?: number }) {
  const { couple, wedding, media } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const revealed = useRevealed();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const wide = media.invitationWide;

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
    const yStart = () => vh() - peek() * H(); // only the finials and roof top show
    const yEnd = () => Math.min(yStart(), vh() - H()); // the stone base and tree at the bottom edge
    const travel = () => yStart() - yEnd();
    // the temple rises exactly with the scroll (1:1), then holds while the leaves fall
    const RISE = Math.max(0.4, travel() / vh());
    const T = Math.max(1.6, RISE + 0.6);

    // the hero's layers that leave upward at the end (the temple's base stays on the arch's top edge)
    const leaving = () => [temple.current, copy.current, ...clouds.current].filter(Boolean);

    tl.fromTo(temple.current, { y: yStart }, { y: yEnd, duration: RISE, ease: "none" }, 0)
      // the names slide down and disappear behind the temple (no fade)
      .to(copy.current, { y: () => travel() * 0.6, duration: RISE, ease: "none" }, 0)
      .to(cue.current, { autoAlpha: 0, duration: Math.min(0.17, RISE * 0.3) }, 0)
      .to({}, { duration: T - RISE }, RISE);

    // clouds drift sideways only, each at its own speed — they stay in the top quarter
    clouds.current.forEach((c, i) => tl.to(c, { x: () => (CLOUDS[i][4] / 100) * vw(), duration: T }, 0));

    // hand-over: everything moves up 1:1 with the scroll, off the top of the screen
    if (tail > 0) tl.to(leaving(), { y: `-=${vh()}`, duration: tail, ease: "none" }, T);

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
    <Scene id="invitation-hero" labelledBy="couple-names" className="cobalt" build={build} tail={0}>
      {/* the temple: full screen width, height from the picture; rises 1:1 with the scroll */}
      <ScenePicture
        ref={temple}
        src={media.invitation}
        ratio="3584 / 4800"
        wide={wide?.src}
        alt="A colourful gopuram against a deep blue sky, with a flowering tree in front"
        className="z-[2]"
        capVh={85}
        eager
      />

      {/* flat clouds: behind the temple, inside the top 25% of the screen */}
      {CLOUDS.map(([left, top, w, h], i) => (
        <Cloud
          key={i}
          ref={(el) => void (clouds.current[i] = el)}
          className="z-0"
          style={{ left: `${left}vw`, top: `${top}svh`, width: `${w}vw`, height: `${h}svh` }}
          opacity={0.92 - (i % 3) * 0.08}
        />
      ))}

      {/* the names on the sky — behind the temple, which rises over them */}
      {/* starts below the clouds (top quarter), with room between every line */}
      <div ref={copy} data-layer className="absolute inset-x-0 top-[max(9rem,23svh)] z-[1] flex justify-center px-gutter">
        <div ref={lines} className="flex max-w-[34rem] flex-col items-center text-center text-white [text-shadow:0_2px_18px_rgb(0_30_90/0.6)]">
          {wedding.invocation && <p className="text-[0.86rem] font-bold tracking-[0.26em] text-[#f3cf73]">{wedding.invocation}</p>}
          <h1 id="couple-names" className="mt-5 font-script font-normal">
            <span className="block text-[clamp(3rem,min(14vw,8.6svh),6.2rem)] leading-[1.12]">{first.name}</span>
            <span className="my-1 block font-body text-[clamp(0.95rem,min(4.2vw,2.5svh),1.35rem)] font-semibold italic leading-none tracking-[0.24em] text-[#f3cf73]">
              weds
            </span>
            <span className="block text-[clamp(3rem,min(14vw,8.6svh),6.2rem)] leading-[1.12]">{second.name}</span>
          </h1>
          <p className="mt-5 text-[0.84rem] font-bold uppercase leading-none tracking-[0.32em]">are getting married</p>
          <p className="mt-5 max-w-[20rem] font-script text-[clamp(1.6rem,min(7vw,4.1svh),2.4rem)] leading-[1.25]">
            Dear {isPersonalized ? guestName : "Family & Friends"}, you are invited
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
