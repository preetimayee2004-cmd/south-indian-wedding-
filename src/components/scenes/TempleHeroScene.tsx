import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGuest } from "@/context/GuestContext";
import { useWedding } from "@/context/WeddingContext";
import { useRevealed } from "@/context/IntroContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Cloud, Leaf, rand } from "@/components/scene/Decor";
import { useAudio } from "@/context/AudioContext";
import { TempleStage, ELEPHANTS, type ElephantRefs } from "./hero/TempleStage";
import { ScrollCue } from "@/components/ui/ScrollCue";

/** The exact sky colour of temple-hero.webp. */
export const TEMPLE_SKY = "#004DB7";
const LEAVES = 7;
/** How much of the portrait picture's top shows at the start: finials + roof top. */
const PEEK = 0.18;
/** The front elephant starts just beyond the left edge; the others follow at the same gaps. */
const WALK_FROM = ELEPHANTS[0].left + ELEPHANTS[0].width + 0.03;
/** One step cycle (s), and each elephant's phase in it. */
const STEP = 1.1;
const PHASE = [0, 2.1, 4.0];

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
 * The temple always spans the full screen width. It starts pushed down so
 * only the golden finials and roof top show at the bottom, then rises exactly
 * with the scroll (1:1) until its stone base and tree reach the bottom edge.
 * The names slide down at 0.6× and disappear behind it (no fade). Clouds
 * drift above the temple in the top quarter; leaves fall in the last 40%. The
 * invitation arch then rises over it on a scalloped edge (`tail`).
 */
export function TempleHeroScene({ tail = 1 }: { tail?: number }) {
  const { couple, wedding } = useWedding();
  const { guestName, isPersonalized } = useGuest();
  const revealed = useRevealed();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const { playing, playSfx } = useAudio();

  const copy = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const temple = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLAnchorElement>(null);
  const clouds = useRef<(HTMLDivElement | null)[]>([]);
  const leaves = useRef<(HTMLDivElement | null)[]>([]);
  const birds = useRef<HTMLDivElement>(null);
  const elephants = useRef<ElephantRefs>({ outer: [], body: [], dust: [] });
  /** where the scroll has walked the procession to (0 = off the left edge, 1 = at the steps) */
  const walk = useRef({ p: 0 });
  const sound = useRef({ playing, playSfx });
  sound.current = { playing, playSfx };

  // The procession: follows the scroll, keeps drifting slowly on its own when the scroll stops,
  // and walks with a bob, a rock around the feet and a dust puff each step; at rest it breathes.
  useEffect(() => {
    const stage = temple.current;
    if (!stage) return;
    // only while the hero is around the screen (the Scene marks it .is-live)
    const scene = stage.closest(".scene");
    let a = 0; // where they actually are
    let w = 0; // how much they are walking (0–1)
    let phase = 0;
    let t = 0;
    let lastSin = [0, 0, 0];
    const puff = (k: number, d: number) => {
      const el = elephants.current.dust[k]?.[d];
      if (el) gsap.fromTo(el, { opacity: 0.55, scale: 0.4, x: 0 }, { opacity: 0, scale: 1.5, x: d ? 10 : -10, duration: 0.9, ease: "power1.out", overwrite: true });
    };
    const tick = (_time: number, dtMs: number) => {
      if (scene && !scene.classList.contains("is-live")) return;
      const dt = Math.min(0.05, dtMs / 1000);
      t += dt;
      const target = walk.current.p;
      const before = a;
      if (a < target) a += (target - a) * Math.min(1, dt * 4); // catch up with the scroll
      else if (a > target + 0.08) a += (target + 0.08 - a) * Math.min(1, dt * 4); // scrolled back
      if (target > 0.001 && a < 1) a = Math.min(1, target + 0.08, a + dt * 0.012); // and drift on slowly
      const speed = Math.abs(a - before) / Math.max(dt, 0.001);
      w += (Math.min(1, speed * 6) - w) * Math.min(1, dt * 5);
      if (w > 0.02) phase += (dt / STEP) * Math.PI * 2;
      const W = stage.offsetWidth;
      const eased = 1 - (1 - a) * (1 - a); // they slow down as they arrive
      const x = -(1 - eased) * WALK_FROM * W;
      ELEPHANTS.forEach((_, k) => {
        const outer = elephants.current.outer[k];
        const body = elephants.current.body[k];
        if (!outer || !body) return;
        outer.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        const ph = phase + PHASE[k];
        const sn = Math.sin(ph);
        const breathe = 1 + 0.008 * Math.sin(t * 1.6 + k) * (1 - w);
        body.style.transform = `translateY(${(-5 * Math.abs(sn) * w).toFixed(2)}px) rotate(${(1.2 * sn * w).toFixed(3)}deg) scale(${breathe.toFixed(4)})`;
        // a step: the body comes down onto a foot
        if (w > 0.3 && Math.sign(sn) !== Math.sign(lastSin[k]) && a > 0.02) {
          puff(k, sn > 0 ? 1 : 0);
          if (k === 0 && sound.current.playing) sound.current.playSfx("bell");
        }
        lastSin[k] = sn;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, []);

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
    const yStart = () => vh() - peek() * H(); // only the finials and roof top show
    const yEnd = () => Math.min(yStart(), vh() - H()); // the stone base and tree at the bottom edge
    const travel = () => yStart() - yEnd();
    // the temple rises exactly with the scroll (1:1), then holds while the leaves fall
    const RISE = Math.max(0.4, travel() / vh());
    const T = Math.max(1.6, RISE + 0.6);

    tl.fromTo(temple.current, { y: yStart }, { y: yEnd, duration: RISE, ease: "none" }, 0)
      // the names slide down and disappear behind the temple (no fade)
      .to(copy.current, { y: () => travel() * 0.6, duration: RISE, ease: "none" }, 0)
      .to(cue.current, { autoAlpha: 0, duration: Math.min(0.17, RISE * 0.3) }, 0)
      .to({}, { duration: T - RISE }, RISE);

    // the procession walks in once the camera reaches the bottom third of the picture, and
    // the front elephant reaches the steps at the end of the hero
    const tIn = Math.min(RISE * 0.85, Math.max(0, ((2 / 3 - PEEK) * H() * RISE) / Math.max(1, travel())));
    tl.fromTo(walk.current, { p: 0 }, { p: 1, duration: T - tIn, ease: "none" }, tIn);

    // a few birds fly across the sky once, right after the names have gone behind the temple
    tl.fromTo(birds.current, { x: () => -0.25 * vw() }, { x: () => 1.15 * vw(), duration: Math.min(0.8, T * 0.4), ease: "none" }, RISE * 0.55);

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
    <Scene id="invitation-hero" labelledBy="couple-names" className="cobalt" build={build} tail={tail}>
      {/* the temple: full screen width, height from the picture; rises 1:1 with the scroll */}
      <TempleStage ref={temple} elephants={elephants} className="z-[2]" eager />

      {/* birds crossing the sky once (moved by the scroll; their wings flap) */}
      <div ref={birds} aria-hidden className="pointer-events-none absolute left-0 top-[11svh] z-[6] h-[8svh] w-[22vw] min-w-[120px]">
        {[
          [0, 0, 26],
          [38, 34, 20],
          [70, 10, 23],
        ].map(([x, y, w], i) => (
          <svg key={i} viewBox="0 0 40 16" className="hero-bird absolute" style={{ left: `${x}%`, top: `${y}%`, width: w, animationDelay: `${-i * 0.23}s` }}>
            <path d="M1 6c6-5 12-5 19 3 7-8 13-8 19-3-6-1-12 1-19 8C13 7 7 5 1 6Z" fill="#1d2b4a" fillOpacity="0.75" />
          </svg>
        ))}
      </div>

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
