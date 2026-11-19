import { useEffect, useRef, type CSSProperties, type MutableRefObject } from "react";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Petal, rand } from "@/components/scene/Decor";
import { gsap, refreshSoon } from "@/lib/gsap";

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

/*
 * Where everything sits on the background (couple-bg, 1376×768), measured
 * against the original picture with both of them in it (couple-scene.webp),
 * in % of the background. left / bottom / height of each cutout's box.
 */
const BRIDE = { left: 39.61, bottom: 6.12, height: 54.17, ratio: "464 / 875" };
const GROOM = { left: 50.36, bottom: 6.25, height: 61.46, ratio: "258 / 901" };
/** The brass lamp flames, [x%, y%]. */
const LAMPS: [number, number][] = [
  [9.7, 67.7],
  [90.3, 67.7],
];

/** Couple-scene timeline, in screens of scroll (the section pins for 350vh). */
const T = 3.5;
const at = (f: number) => f * T;

/**
 * The background, the bride and the groom on one stage (the couple-stage CSS
 * covers the screen, centred on where they meet; the sides crop on phones).
 * Shared by the animated scene and the still version (reduced motion).
 */
function CoupleRoom({
  refs,
  still = false,
}: {
  refs?: Record<"stage" | "bg" | "bride" | "brideBob" | "brideTilt" | "groom" | "groomBob", MutableRefObject<HTMLDivElement | null>> & {
    lamps: MutableRefObject<(HTMLSpanElement | null)[]>;
    lines: MutableRefObject<(HTMLSpanElement | null)[]>;
  };
  still?: boolean;
}) {
  const { couple, media } = useWedding();
  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const art = media.coupleWalk;

  const box = (p: typeof BRIDE): CSSProperties => ({ left: `${p.left}%`, bottom: `${p.bottom}%`, height: `${p.height}%`, aspectRatio: p.ratio });
  const glow = (x: number, y: number): CSSProperties => ({
    left: `${x}%`,
    top: `${y}%`,
    width: "8%",
    aspectRatio: "1",
    translate: "-50% -50%",
    background: "radial-gradient(circle, rgb(255 214 120 / 0.85) 0%, rgb(255 170 60 / 0.35) 38%, transparent 70%)",
  });
  const onLoad = () => refreshSoon(80);

  return (
    <div className="couple-room absolute inset-0">
      <div ref={refs?.stage} className="couple-stage">
        {/* the temple background; the lamp glows ride along with it */}
        <div ref={refs?.bg} data-layer className="absolute inset-0" style={{ transformOrigin: "50% 63%" }}>
          <img
            src={art.bg.replace(/\.webp$/, "@2x.webp")}
            alt="Five painted temple towers, steps in the middle, garlands, banana leaves, brass lamps and lotus flowers"
            decoding="async"
            onLoad={onLoad}
            className="block h-full w-full"
            draggable={false}
          />
          {LAMPS.map(([x, y], i) => (
            <span
              key={i}
              ref={(el) => void (refs && (refs.lamps.current[i] = el))}
              aria-hidden
              className={`pointer-events-none absolute rounded-full mix-blend-screen ${still ? "" : "invisible"}`}
              style={glow(x, y)}
            />
          ))}
        </div>
        {/* groom behind, bride in front (her garland passes over him) */}
        <div ref={refs?.groom} data-layer className="absolute" style={box(GROOM)}>
          <div ref={refs?.groomBob} className="h-full w-full">
            <img src={art.groom} alt={`${couple.groom.name}, the groom, wearing a garland`} decoding="async" onLoad={onLoad} className="couple-idle block h-full w-full" style={{ animationDelay: "-1.3s" }} draggable={false} />
          </div>
        </div>
        <div ref={refs?.bride} data-layer className="absolute" style={box(BRIDE)}>
          <div ref={refs?.brideBob} className="h-full w-full">
            <div ref={refs?.brideTilt} className="h-full w-full" style={{ transformOrigin: "50% 100%" }}>
              <img src={art.bride} alt={`${couple.bride.name}, the bride, with a garland`} decoding="async" onLoad={onLoad} className="couple-idle block h-full w-full" draggable={false} />
            </div>
          </div>
        </div>
      </div>

      {/* the names, one line at a time, in the sky above their heads */}
      <div className="couple-names pointer-events-none absolute inset-x-0 flex items-center justify-center">
        <h2 id="couple-heading" className="couple-glow relative text-center font-script font-normal leading-[1.02] text-accent">
          {[first.name, "&", second.name].map((t, i) => (
            <span
              key={i}
              ref={(el) => void (refs && (refs.lines.current[i] = el))}
              className={`block ${i === 1 ? "couple-amp text-gold" : ""} ${still ? "" : "invisible"}`}
            >
              {t === "&" ? <>&amp;</> : t}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
}

/**
 * Scene 2 — the couple. The section pins for 350vh (scrub 1.2): the
 * background settles (1.12 → 1), the bride walks in from the left and the
 * groom from the right with a small walking bob that fades as they stop, she
 * leans in 2° to place the garland, then petals fall, the lamps glow and the
 * names appear above them. It holds, and the next section rises over it.
 * Scrolling back plays it in reverse. While resting each one breathes
 * (CSS couple-idle, outside the scrub).
 */
export function CoupleScene() {
  const refs = {
    stage: useRef<HTMLDivElement>(null),
    bg: useRef<HTMLDivElement>(null),
    bride: useRef<HTMLDivElement>(null),
    brideBob: useRef<HTMLDivElement>(null),
    brideTilt: useRef<HTMLDivElement>(null),
    groom: useRef<HTMLDivElement>(null),
    groomBob: useRef<HTMLDivElement>(null),
    lamps: useRef<(HTMLSpanElement | null)[]>([]),
    lines: useRef<(HTMLSpanElement | null)[]>([]),
  };
  const petals = useRef<(HTMLDivElement | null)[]>([]);

  // keep the pin's measurements right when the screen's height changes too (phone address bar, rotation)
  useEffect(() => {
    const on = () => refreshSoon(200);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const build: Build = (tl) => {
    const stage = refs.stage.current!;
    const bride = refs.bride.current!;
    const groom = refs.groom.current!;
    const lamps = refs.lamps.current.filter(Boolean);
    const lines = refs.lines.current.filter(Boolean);

    // 0–15%: the background settles
    tl.fromTo(refs.bg.current, { scale: 1.12 }, { scale: 1, duration: at(0.15), ease: "power1.out" }, 0);

    // 15–55%: they walk in from beyond the edges to where they meet
    const walk = at(0.4);
    tl.fromTo(bride, { x: () => -(stage.offsetLeft + bride.offsetLeft + bride.offsetWidth + 24) }, { x: 0, duration: walk, ease: "power2.out" }, at(0.15));
    tl.fromTo(groom, { x: () => window.innerWidth - (stage.offsetLeft + groom.offsetLeft) + 24 }, { x: 0, duration: walk, ease: "power2.out" }, at(0.15));
    // the walking bob: 6px, ~5 steps, fading out as they stop (scrubbed, so it reverses too)
    const step = { t: 0 };
    const bob = () => {
      const fade = (1 - step.t) ** 1.5;
      gsap.set(refs.brideBob.current, { y: -6 * Math.abs(Math.sin(step.t * Math.PI * 5)) * fade });
      gsap.set(refs.groomBob.current, { y: -6 * Math.abs(Math.sin(step.t * Math.PI * 5 + 0.9)) * fade });
    };
    tl.fromTo(step, { t: 0 }, { t: 1, duration: walk, ease: "none", onUpdate: bob }, at(0.15));

    // 55–65%: she leans in 2° and back, placing the garland
    tl.to(refs.brideTilt.current, { rotate: 2, duration: at(0.05), ease: "sine.inOut" }, at(0.55));
    tl.to(refs.brideTilt.current, { rotate: 0, duration: at(0.05), ease: "sine.inOut" }, at(0.6));

    // 65–85%: petals at three speeds, the lamps glow, the names one line at a time
    addPetals(tl, petals.current, at(0.65), at(0.2));
    tl.fromTo(lamps, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1.15, duration: at(0.06), ease: "sine.out" }, at(0.65))
      .to(lamps, { autoAlpha: 0.55, scale: 0.95, duration: at(0.04), ease: "sine.inOut" }, at(0.71))
      .to(lamps, { autoAlpha: 1, scale: 1.1, duration: at(0.04), ease: "sine.inOut" }, at(0.75))
      .to(lamps, { autoAlpha: 0.85, scale: 1, duration: at(0.06), ease: "sine.inOut" }, at(0.79));
    tl.fromTo(lines, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: at(0.06), stagger: at(0.055), ease: "power2.out" }, at(0.66));

    // 85–100%: hold (the next section then rises over the scene)
    tl.to({}, { duration: Math.max(0, T - tl.duration()) });
  };

  return (
    <Scene
      id="couple"
      labelledBy="couple-heading"
      className="cobalt"
      style={{ containerType: "size" }}
      scrub={1.2}
      build={build}
      edgeTop={<div aria-hidden className="edge edge-scallop-top" style={{ ["--edge" as string]: "var(--sky-top)" }} />}
    >
      <CoupleRoom refs={refs} />
      <Petals refs={petals} />
    </Scene>
  );
}

/** Reduced motion: no pinning; the couple simply stand where they meet, and the section fades in. */
export function CoupleStill() {
  return (
    <section id="couple" aria-labelledby="couple-heading" className="cobalt couple-fade relative h-[100svh] min-h-[520px] overflow-hidden" style={{ containerType: "size" }}>
      <CoupleRoom still />
    </section>
  );
}
