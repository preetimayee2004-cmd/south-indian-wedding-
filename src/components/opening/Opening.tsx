import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useWedding } from "@/context/WeddingContext";
import { useAudio } from "@/context/AudioContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { Threads, knotScale } from "./Threads";
import { T } from "./timing";
import { desktopArt } from "@/components/desktop/art";

interface OpeningProps {
  /** Called once the page underneath should become visible/interactive. */
  onReveal: () => void;
  /** Called when the overlay has fully faded and can unmount. */
  onDone: () => void;
  /** Laptop/desktop: full-screen doors that open straight onto the hero scene. */
  desktop?: boolean;
}

type Phase = "entering" | "ready" | "opening";

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSize({ w: window.innerWidth, h: window.innerHeight }));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return size;
}

function decode(src: string) {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => undefined);
}

/**
 * Opening experience:
 *  1. Two threads travel in from the edges and tie a knot; a golden glow blooms.
 *  2. Tap (anywhere) → knot squeezes, unties, threads pull apart, the entrance
 *     panels part on a seam of golden light.
 *  3. Behind them: the couple's names on the sky; the camera tilts down as the
 *     gopuram rises, then pushes through its doorway into warm light, revealing
 *     the invitation. Music fades in on the tap.
 * Skip is available throughout. Reduced motion → static knot + crossfade.
 */
export function Opening({ onReveal, onDone, desktop = false }: OpeningProps) {
  const config = useWedding();
  const { media, opening, couple, wedding } = config;
  const doorDesk = desktopArt(config, "opening");
  const { start: startMusic, playSfx } = useAudio();
  const reduced = usePrefersReducedMotion();
  const { w, h } = useViewport();
  const [phase, setPhase] = useState<Phase>("entering");

  const root = useRef<HTMLDivElement>(null);
  const stageB = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const doorL = useRef<HTMLDivElement>(null);
  const doorR = useRef<HTMLDivElement>(null);
  const seam = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLParagraphElement>(null);
  const dive = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLDivElement>(null);
  const names = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);

  const enterTl = useRef<gsap.core.Timeline | null>(null);
  const openTl = useRef<gsap.core.Timeline | null>(null);
  const pulse = useRef<gsap.core.Tween | null>(null);
  const ctx = useRef<gsap.Context | null>(null);
  const finished = useRef(false);

  const first = couple.order === "bride-first" ? couple.bride : couple.groom;
  const second = couple.order === "bride-first" ? couple.groom : couple.bride;
  const dateLabel = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(wedding.dateISO))
    .replace(/\//g, " · ");

  // Lock page scroll while the overlay is up.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  }, [onDone]);

  // ── 1. Enter: threads draw in and tie the knot ────────────────────────
  useLayoutEffect(() => {
    ctx.current = gsap.context(() => {
      gsap.set(sky.current, { xPercent: -50, scale: 1.7, transformOrigin: "50% 0%" });
      gsap.set(dive.current, { transformOrigin: `50% ${media.openingDoorY * 100}%` });
      gsap.set(names.current, { autoAlpha: 0 });
      gsap.set(seam.current, { xPercent: -50, autoAlpha: 0, scaleX: 0.05 });
      gsap.set(label.current, { autoAlpha: 0, y: 8 });
      gsap.set([doorL.current, doorR.current], { autoAlpha: 0 });

      const draws = svg.current!.querySelectorAll(".thread-draw");
      const glow = svg.current!.querySelector(".thread-glow");

      if (reduced) {
        gsap.set([doorL.current, doorR.current], { autoAlpha: 1 });
        gsap.set(draws, { strokeDashoffset: 0 });
        gsap.set(glow, { opacity: 0.8 });
        gsap.set(label.current, { autoAlpha: 1, y: 0 });
        setPhase("ready");
        return;
      }

      const tl = gsap.timeline({ paused: true, onComplete: () => setPhase("ready") });
      tl.to([doorL.current, doorR.current], { autoAlpha: 1, duration: T.enter.bgFade, ease: "power1.out" })
        .to(draws, { strokeDashoffset: 0, duration: T.enter.threadsDraw, ease: "power2.inOut", stagger: 0.12 }, T.enter.threadsDelay)
        .to(glow, { opacity: 1, duration: T.enter.glow, ease: "sine.out" }, "-=0.35")
        .to(label.current, { autoAlpha: 1, y: 0, duration: T.enter.label, ease: "power2.out" }, "-=0.2");
      enterTl.current = tl;

      // Start once the two hero images are decoded, so nothing pops in mid-motion.
      const timeout = new Promise((r) => setTimeout(r, 1500));
      Promise.race([Promise.all([decode(media.opening), decode(media.openingReveal)]), timeout]).then(() => tl.play());
    }, root);
    return () => ctx.current?.revert();
    // Geometry changes on resize are handled by pathLength=1; don't rebuild the timeline.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Gentle breathing glow while waiting for the tap.
  useEffect(() => {
    if (phase !== "ready" || reduced || !svg.current) return;
    const glow = svg.current.querySelector(".thread-glow");
    pulse.current = gsap.to(glow, { opacity: 0.55, duration: T.enter.pulse, ease: "sine.inOut", yoyo: true, repeat: -1 });
    return () => {
      pulse.current?.kill();
    };
  }, [phase, reduced]);

  // ── 2 + 3. Tap: untie, part the doors, tilt, dive ─────────────────────
  const begin = useCallback(() => {
    if (phase === "opening" || finished.current) return;
    setPhase("opening");
    startMusic();
    playSfx("thread");
    pulse.current?.kill();

    ctx.current?.add(() => {
      if (reduced) {
        onReveal();
        gsap.to(root.current, { autoAlpha: 0, duration: T.reducedFade, onComplete: finish });
        return;
      }

      enterTl.current?.progress(1); // tapped early: jump to the tied knot
      const O = T.open;
      const draws = svg.current!.querySelectorAll(".thread-draw");
      const glow = svg.current!.querySelector(".thread-glow");
      const knot = svg.current!.querySelector(".thread-knot");
      const origin = `${w / 2} ${h / 2}`;

      if (desktop) {
        // Desktop: untie, then the doors part directly onto the hero scene.
        const tl = gsap.timeline({ onComplete: finish });
        openTl.current = tl;
        tl.to(knot, { scale: 0.9, svgOrigin: origin, duration: O.squeeze * 0.45, ease: "power2.in" })
          .to(knot, { scale: 1.07, svgOrigin: origin, duration: O.squeeze * 0.55, ease: "back.out(3)" })
          .addLabel("release")
          .to(draws, { strokeDashoffset: 1, duration: O.retract, ease: "power2.in" }, "release")
          .to([glow, label.current], { opacity: 0, duration: O.retract * 0.6 }, "release")
          .to(seam.current, { autoAlpha: 1, scaleX: 1, duration: O.seam, ease: "power2.out" }, "release+=0.3")
          .add(() => {
            onReveal();
            gsap.set(root.current, { backgroundColor: "transparent" });
          }, "release+=0.55")
          .to(doorL.current, { xPercent: -100, duration: O.doors * 1.15, ease: "power3.inOut" }, "release+=0.55")
          .to(doorR.current, { xPercent: 100, duration: O.doors * 1.15, ease: "power3.inOut" }, "release+=0.55")
          .to(seam.current, { autoAlpha: 0, scaleX: 2.2, duration: 0.9, ease: "power1.out" }, "release+=0.9")
          .to(root.current, { autoAlpha: 0, duration: 0.4 }, ">-0.25");
        return;
      }

      gsap.set(stageB.current, { autoAlpha: 1 });
      const tl = gsap.timeline({ onComplete: finish });
      openTl.current = tl;

      tl.to(knot, { scale: 0.9, svgOrigin: origin, duration: O.squeeze * 0.45, ease: "power2.in" })
        .to(knot, { scale: 1.07, svgOrigin: origin, duration: O.squeeze * 0.55, ease: "back.out(3)" })
        .addLabel("release")
        .to(draws, { strokeDashoffset: 1, duration: O.retract, ease: "power2.in" }, "release")
        .to([glow, label.current], { opacity: 0, duration: O.retract * 0.6 }, "release")
        .to(seam.current, { autoAlpha: 1, scaleX: 1, duration: O.seam, ease: "power2.out" }, "release+=0.3")
        .to(doorL.current, { xPercent: -62, duration: O.doors, ease: "power3.inOut" }, "release+=0.4")
        .to(doorR.current, { xPercent: 62, duration: O.doors, ease: "power3.inOut" }, "release+=0.4")
        .to(seam.current, { autoAlpha: 0, duration: 0.6 }, "release+=0.95")
        .fromTo(names.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: O.names, ease: "power2.out" }, "release+=0.9")
        .to(sky.current, { scale: 1, duration: O.tilt, ease: "power2.inOut" }, "release+=1.2")
        .to(names.current, { y: -48, autoAlpha: 0, duration: 0.8, ease: "power1.in" }, `>+${O.hold}`)
        .to(dive.current, { scale: 9, duration: O.dive, ease: "power3.in" }, "<0.1")
        .to(light.current, { autoAlpha: 1, duration: O.light, ease: "power1.in" }, `>-${O.light}`)
        .add(() => onReveal())
        .to(root.current, { autoAlpha: 0, duration: O.fadeOut, ease: "power1.out" });
    });
  }, [phase, reduced, startMusic, playSfx, w, h, onReveal, finish, desktop]);

  const skip = useCallback(() => {
    if (finished.current) return;
    startMusic(); // Skip is a user gesture too.
    enterTl.current?.kill();
    openTl.current?.kill();
    pulse.current?.kill();
    onReveal();
    gsap.to(root.current, { autoAlpha: 0, duration: T.skipFade, ease: "power1.out", onComplete: finish });
  }, [startMusic, onReveal, finish]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      begin();
    }
  };

  // The entrance art. Desktop: the art fills the screen (each door shows its half).
  // Phones: each door anchors the image to its own screen edge so both pillars stay visible.
  const doorArt = (side: "left" | "right") => (
    <div className="absolute inset-0 bg-ivory">
      {desktop ? (
        <img
          src={doorDesk.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `50% ${(doorDesk.focus ?? 0.3) * 100}%` }}
          draggable={false}
        />
      ) : (
        <img
          src={media.opening}
          alt=""
          className="absolute top-0 h-full max-w-none object-cover"
          style={{ aspectRatio: "768 / 1376", [side]: "max(0px, calc(50vw - 27.907svh))" }}
          draggable={false}
        />
      )}
    </div>
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-50 touch-none select-none overflow-hidden bg-ivory"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation opening"
    >
      {/* ── Stage B (behind the doors): sky, names, gopuram ── */}
      <div ref={stageB} className="invisible absolute inset-0 overflow-hidden bg-[#5f9fdc]">
        <div ref={dive} className="absolute inset-0 will-change-transform">
          <img src={media.openingReveal} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
          <div ref={sky} className="absolute bottom-0 left-1/2 h-full will-change-transform" style={{ aspectRatio: "768 / 1376" }}>
            <img src={media.openingReveal} alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
        </div>
        <div ref={names} className="absolute inset-x-0 top-[13%] px-gutter text-center text-white [text-shadow:0_2px_18px_rgb(30_60_110/0.35)]">
          {wedding.blessing && <p className="text-sm tracking-[0.3em] opacity-90">{wedding.blessing}</p>}
          <p className="mt-3 font-script text-[clamp(3rem,min(13vw,9svh),6.5rem)] leading-none">{first.name}</p>
          <p className="my-1 font-script text-script-md opacity-90">&amp;</p>
          <p className="font-script text-[clamp(3rem,min(13vw,9svh),6.5rem)] leading-none">{second.name}</p>
          <p className="mt-5 text-eyebrow uppercase opacity-90">{dateLabel}</p>
        </div>
        <div
          ref={light}
          className="invisible absolute inset-0 opacity-0"
          style={{ background: "radial-gradient(circle at 50% 70%, #fff6dc 0%, #f7f2eb 55%, #f7f2eb 100%)" }}
        />
      </div>

      {/* ── Stage A: entrance panels that part like temple doors ── */}
      <div ref={doorL} className="absolute inset-0 will-change-transform" style={{ clipPath: "inset(0 50% 0 0)" }}>
        {doorArt("left")}
      </div>
      <div ref={doorR} className="absolute inset-0 will-change-transform" style={{ clipPath: "inset(0 0 0 50%)" }}>
        {doorArt("right")}
      </div>
      <div
        ref={seam}
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[70vw]"
        style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgb(255 236 180 / 0.95), rgb(243 194 90 / 0.35) 45%, transparent 75%)" }}
      />

      <Threads ref={svg} width={w} height={h} colors={opening.threadColors} />

      {/* Tap target: the whole stage, with the knot as the visual focus. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`${opening.tapLabel} — open the invitation`}
        aria-disabled={phase === "opening"}
        onClick={begin}
        onKeyDown={onKey}
        className="absolute inset-0 cursor-pointer outline-none focus-visible:[&>p]:underline"
        style={{ pointerEvents: phase === "opening" ? "none" : "auto" }}
      >
        <p ref={label} className="eyebrow absolute inset-x-0 text-center !text-ink" style={{ top: `calc(50% + ${knotScale(w) * 34}px)` }}>
          {opening.tapLabel}
        </p>
      </div>

      <button
        type="button"
        onClick={skip}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-ink/15 bg-paper/80 px-4 py-2 text-eyebrow uppercase text-ink-soft backdrop-blur transition-colors hover:text-accent"
      >
        Skip
      </button>
    </div>
  );
}
