import { useEffect, useRef, type CSSProperties, type MutableRefObject } from "react";
import { useSfxOnView } from "@/hooks/useSfxOnView";
import { useWedding } from "@/context/WeddingContext";
import { Scene, type Build } from "@/components/scene/Scene";
import { Petal, rand } from "@/components/scene/Decor";
import { gsap, refreshSoon } from "@/lib/gsap";
import { CloudMessage, type CloudRefs } from "./couple/CloudMessage";
import { Toran } from "./couple/Toran";

/** The couple picture's own sky colour at its top (couple-bg), continued above it. */
const COUPLE_SKY = "#0058BE";

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
// they stop a little apart (her garland just reaching him), not pressed together
const BRIDE = { left: 37.32, bottom: 6.12, height: 54.17, ratio: "464 / 875" };
const GROOM = { left: 52.65, bottom: 6.25, height: 61.46, ratio: "258 / 901" };
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
    cloud: MutableRefObject<CloudRefs>;
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

      {/* the names in a cloud, in the sky above their heads (never over their faces) */}
      <CloudMessage first={first.name} second={second.name} refs={refs?.cloud} still={still} />
    </div>
  );
}

/**
 * Scene 2 — the couple. As soon as the section comes onto the screen the
 * bride walks in from the left and the groom from the right (scrub 1.2), with
 * a small walking bob that fades as they stop a little apart, a short way into
 * the pin. The section pins for 350vh: the background settles (1.12 → 1), she
 * leans in 2° offering the garland and the lamps glow; two small clouds drift in
 * and merge into a big one above them, the names write in, and petals fall from
 * it onto the couple. It holds, and the next section rises over it while the
 * cloud drifts up and away.
 * Scrolling back plays it in reverse. While resting each one breathes
 * (CSS couple-idle, outside the scrub).
 */
export function CoupleScene() {
  // footsteps and the bride's anklets (kolusu) as the two walk in
  useSfxOnView("#couple", [["kolusu", { volume: 0.9 }]], { rootMargin: "0px 0px -12% 0px" });
  const refs = {
    stage: useRef<HTMLDivElement>(null),
    bg: useRef<HTMLDivElement>(null),
    bride: useRef<HTMLDivElement>(null),
    brideBob: useRef<HTMLDivElement>(null),
    brideTilt: useRef<HTMLDivElement>(null),
    groom: useRef<HTMLDivElement>(null),
    groomBob: useRef<HTMLDivElement>(null),
    lamps: useRef<(HTMLSpanElement | null)[]>([]),
    cloud: useRef<CloudRefs>({ drift: null, main: null, left: null, right: null, label: null, amp: null, letters: [], flourish: null, petals: [], rain: null }),
  };

  // keep the pin's measurements right when the screen's height changes too (phone address bar, rotation)
  useEffect(() => {
    const on = () => refreshSoon(200);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const build: Build = (tl, section) => {
    const stage = refs.stage.current!;
    const bride = refs.bride.current!;
    const groom = refs.groom.current!;
    const lamps = refs.lamps.current.filter(Boolean);
    const c = refs.cloud.current;

    // 0–15%: the background settles
    tl.fromTo(refs.bg.current, { scale: 1.12 }, { scale: 1, duration: at(0.15), ease: "power1.out" }, 0);

    // They start walking in the moment the section comes onto the screen (its top at the
    // screen's bottom) and arrive a little after it pins (35% of the pinned scroll), from
    // beyond the edges to where they meet, smoothly with the scroll (and back in reverse).
    const walkEnd = () => `top+=${Math.round(at(0.35) * window.innerHeight)} top`;
    const walkIn = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, start: "top bottom", end: walkEnd, scrub: 1.2, invalidateOnRefresh: true },
    });
    walkIn.fromTo(bride, { x: () => -(stage.offsetLeft + bride.offsetLeft + bride.offsetWidth + 24) }, { x: 0, duration: 1, ease: "power2.out" }, 0);
    walkIn.fromTo(groom, { x: () => window.innerWidth - (stage.offsetLeft + groom.offsetLeft) + 24 }, { x: 0, duration: 1, ease: "power2.out" }, 0);
    
    // Clouds start drifting in at the same time the couple starts walking in
    const edge = () => window.innerWidth * 0.65;
    walkIn.fromTo(c.left, { x: () => -edge(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, ease: "power1.out" }, 0);
    walkIn.fromTo(c.right, { x: edge, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1, ease: "power1.out" }, 0);

    // the walking bob: 6px, ~7 steps, fading out as they stop (scrubbed, so it reverses too)
    const step = { t: 0 };
    const bob = () => {
      const fade = (1 - step.t) ** 1.5;
      gsap.set(refs.brideBob.current, { y: -6 * Math.abs(Math.sin(step.t * Math.PI * 7)) * fade });
      gsap.set(refs.groomBob.current, { y: -6 * Math.abs(Math.sin(step.t * Math.PI * 7 + 0.9)) * fade });
    };
    walkIn.fromTo(step, { t: 0 }, { t: 1, duration: 1, onUpdate: bob }, 0);

    // 40–50%: she leans in 2° and back, offering the garland
    tl.to(refs.brideTilt.current, { rotate: 2, duration: at(0.05), ease: "sine.inOut" }, at(0.4));
    tl.to(refs.brideTilt.current, { rotate: 0, duration: at(0.05), ease: "sine.inOut" }, at(0.45));

    // the lamps glow up as they meet
    tl.fromTo(lamps, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1.15, duration: at(0.06), ease: "sine.out" }, at(0.36))
      .to(lamps, { autoAlpha: 0.55, scale: 0.95, duration: at(0.04), ease: "sine.inOut" }, at(0.42))
      .to(lamps, { autoAlpha: 1, scale: 1.1, duration: at(0.04), ease: "sine.inOut" }, at(0.46))
      .to(lamps, { autoAlpha: 0.85, scale: 1, duration: at(0.06), ease: "sine.inOut" }, at(0.5));

    // Right as they meet, the two clouds merge into the big one
    tl.to([c.left, c.right], { autoAlpha: 0, scale: 1.2, duration: at(0.04) }, at(0.35));
    tl.fromTo(c.main, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: at(0.05), ease: "back.out(2)" }, at(0.36));

    // "THE COUPLE", then the names write in letter by letter, the "&" in its lotus, then the flourish draws
    tl.fromTo(c.label, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: at(0.025), ease: "power2.out" }, at(0.45));
    const half = c.letters.length;
    tl.fromTo(c.letters, { autoAlpha: 0, y: 8, scale: 0.85 }, { autoAlpha: 1, y: 0, scale: 1, duration: at(0.02), stagger: at(0.11) / Math.max(1, half), ease: "power2.out" }, at(0.475));
    tl.fromTo(c.amp, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: at(0.03), ease: "back.out(2)" }, at(0.52));
    tl.fromTo(c.flourish, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: at(0.04), ease: "power1.inOut" }, at(0.58));

    // Petals fall from under the cloud onto the couple, then keep falling lightly
    c.petals.forEach((el, i) => {
      const fall = () => {
        const cloud = c.main!.getBoundingClientRect();
        const stageBox = refs.stage.current!.getBoundingClientRect();
        return Math.max(60, stageBox.top + stageBox.height * 0.9 - cloud.bottom);
      };
      tl.fromTo(
        el,
        { y: 0, x: 0, rotate: rand(i, 71) * 180, autoAlpha: 1 },
        { y: fall, x: (rand(i, 73) - 0.5) * 80, rotate: `+=${200 + rand(i, 79) * 260}`, autoAlpha: 0.2, duration: at(0.08 + rand(i, 83) * 0.05), ease: "none" },
        at(0.62 + (i / c.petals.length) * 0.05),
      );
    });
    tl.fromTo(c.rain, { autoAlpha: 0 }, { autoAlpha: 1, duration: at(0.03) }, at(0.72));

    // Auto-scroll to family section when animation finishes
    let autoScrolled = false;
    tl.add(() => {
      autoScrolled = false;
    }, at(0.2));

    tl.add(() => {
      if (!autoScrolled) {
        autoScrolled = true;
        const fam = document.getElementById("family");
        // only a gentle nudge forward while the guest is still at the couple scene —
        // never pull them back up after a fast swipe past it (that felt like a jump/lag on phones)
        const top = fam?.getBoundingClientRect().top ?? -1;
        if (fam && top > 0 && top < window.innerHeight * 1.5) {
          fam.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, at(0.78));

    // hold to the end
    tl.to({}, { duration: Math.max(0, T - tl.duration()) });

  };

  return (
    <Scene
      id="couple"
      labelledBy="couple-heading"
      style={{ containerType: "size", backgroundColor: COUPLE_SKY }}
      scrub={1.2}
      build={build}
    >
      <CoupleRoom refs={refs} />
      <Toran />
    </Scene>
  );
}

/** Reduced motion: no pinning; the couple simply stand where they meet, and the section fades in. */
export function CoupleStill() {
  return (
    <section id="couple" aria-labelledby="couple-heading" className="couple-fade relative h-[100svh] min-h-[520px] overflow-hidden" style={{ containerType: "size", backgroundColor: COUPLE_SKY }}>
      <CoupleRoom still />
      <Toran />
    </section>
  );
}
