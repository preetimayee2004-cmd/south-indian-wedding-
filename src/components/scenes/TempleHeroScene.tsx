import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Leaf, rand } from "@/components/scene/Decor";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { art2x } from "@/lib/art";

/** The exact sky colour of temple-hero.webp, so the picture's edges vanish. */
export const TEMPLE_SKY = "#004DB7";
const LEAVES = 7;

/**
 * Scene 1 — Hero + temple (pinned 250vh, scrub 1).
 * The names sit on the cobalt sky; only the finials and the top of the roof
 * peek above the bottom edge. Scrolling, the temple grows from 0.45 to its
 * full size (sized at final zoom, never above 1) and rises, so the camera
 * travels from the roof down the tower to the stone base and the tree.
 * Names rise at half the temple's speed and fade in the first 30%. Clouds
 * drift behind and in front at different speeds; leaves fall in the last 40%.
 * The next section then rises over it with a scalloped edge (`tail`).
 */
export function TempleHeroScene({ tail = 1 }: { tail?: number }) {
  const { couple, wedding, media } = useWedding();
  const { guestName } = useGuest();
  const revealed = useRevealed();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const d = new Date(wedding.dateISO);
  const dateLine = new Intl.DateTimeFormat("en-GB", { timeZone: wedding.timeZone, day: "numeric", month: "long", year: "numeric" }).format(d);

  const copy = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const temple = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);
  const back = useRef<(HTMLDivElement | null)[]>([]);
  const front = useRef<(HTMLDivElement | null)[]>([]);
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
    const H = () => temple.current!.offsetHeight; // final (scale 1) height
    const y0 = () => vh() - 0.18 * 0.45 * H(); // finials + top of the roof peek in
    const y1 = () => vh() - H(); // base and tree at the bottom edge
    const travel = () => y0() - y1();
    const T = 2.5;

    tl.fromTo(
      temple.current,
      { xPercent: -50, scale: 0.45, y: y0 },
      { xPercent: -50, scale: 1, y: y1, duration: T, ease: "power1.inOut" },
      0,
    )
      // names: half the temple's speed, gone by 30%
      .to(copy.current, { y: () => -travel() / 2, duration: T, ease: "power1.inOut" }, 0)
      .to(copy.current, { opacity: 0, duration: T * 0.3, ease: "power1.in" }, 0)
      .to(cue.current, { autoAlpha: 0, duration: 0.15 }, 0);

    // clouds: behind move slower than the temple, in front faster
    const backSpeed = [0.12, 0.22];
    const frontSpeed = [1.15, 1.35, 1.25];
    back.current.forEach((c, i) =>
      tl.to(c, { x: () => (i % 2 ? -1 : 1) * vw() * 0.14, y: () => -travel() * backSpeed[i], duration: T }, 0),
    );
    front.current.forEach((c, i) =>
      tl.to(c, { x: () => (i % 2 ? -1 : 1) * vw() * 0.12, y: () => -travel() * frontSpeed[i], duration: T }, 0),
    );

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
      {/* clouds behind the temple */}
      <Cloud ref={(el) => void (back.current[0] = el)} className="left-[-10vw] top-[12svh] h-[22vw] max-h-40 w-[48vw] max-w-sm" opacity={0.85} />
      <Cloud ref={(el) => void (back.current[1] = el)} className="right-[-12vw] top-[30svh] h-[18vw] max-h-32 w-[40vw] max-w-xs" opacity={0.8} />

      {/* the temple, sized at its final zoom; GSAP scales it 0.45 → 1 about its top centre */}
      <div
        ref={temple}
        data-layer
        className="absolute left-1/2 top-0 origin-top"
        style={{
          height: "clamp(125svh, 133.33vw, 150svh)",
          aspectRatio: "3 / 4",
          maskImage: "linear-gradient(to right, transparent, #000 4%, #000 96%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 4%, #000 96%, transparent)",
        }}
      >
        <img
          {...art2x(media.invitation)}
          alt="A colourful gopuram against a deep blue sky, with a flowering tree in front"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* clouds in front */}
      <Cloud ref={(el) => void (front.current[0] = el)} className="left-[-16vw] top-[64svh] z-[5] h-[24vw] max-h-44 w-[56vw] max-w-md" />
      <Cloud ref={(el) => void (front.current[1] = el)} className="right-[-18vw] top-[86svh] z-[5] h-[26vw] max-h-48 w-[62vw] max-w-lg" />
      <Cloud ref={(el) => void (front.current[2] = el)} className="left-[18vw] top-[118svh] z-[5] h-[22vw] max-h-40 w-[50vw] max-w-md" opacity={0.9} />

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
